#!/bin/bash

# ECS Deployment Script with Redis Caching
# This script deploys PayloadCMS to ECS with Redis ElastiCache

set -e

# Configuration
CLUSTER_NAME="payloadcms-cluster"
SERVICE_NAME="payloadcms-service"
TASK_DEFINITION="payloadcms-cache"
REGION="ap-southeast-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting ECS deployment with Redis caching...${NC}"

# Step 1: Check if Redis ElastiCache exists
echo -e "${YELLOW}📋 Checking Redis ElastiCache...${NC}"
REDIS_CLUSTER_NAME="payloadcms-redis"

if aws elasticache describe-cache-clusters --cache-cluster-id $REDIS_CLUSTER_NAME --region $REGION >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis ElastiCache cluster exists${NC}"
    REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
        --cache-cluster-id $REDIS_CLUSTER_NAME \
        --region $REGION \
        --query 'CacheClusters[0].ConfigurationEndpoint.Address' \
        --output text)
else
    echo -e "${YELLOW}⚠️ Redis ElastiCache cluster not found. Creating...${NC}"
    
    # Create Redis ElastiCache cluster
    aws elasticache create-cache-cluster \
        --cache-cluster-id $REDIS_CLUSTER_NAME \
        --engine redis \
        --cache-node-type cache.t3.micro \
        --num-cache-nodes 1 \
        --port 6379 \
        --region $REGION \
        --subnet-group-name default \
        --security-group-ids sg-xxxxxxxxx \
        --tags Key=Environment,Value=production Key=Service,Value=payloadcms
    
    echo -e "${GREEN}✅ Redis ElastiCache cluster created${NC}"
    
    # Wait for cluster to be available
    echo -e "${YELLOW}⏳ Waiting for Redis cluster to be available...${NC}"
    aws elasticache wait cache-cluster-available \
        --cache-cluster-id $REDIS_CLUSTER_NAME \
        --region $REGION
    
    REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
        --cache-cluster-id $REDIS_CLUSTER_NAME \
        --region $REGION \
        --query 'CacheClusters[0].ConfigurationEndpoint.Address' \
        --output text)
fi

echo -e "${GREEN}📍 Redis endpoint: $REDIS_ENDPOINT${NC}"

# Step 2: Update task definition with Redis configuration
echo -e "${YELLOW}📝 Updating task definition...${NC}"

# Create updated task definition
cat > task-definition-updated.json << EOF
{
  "family": "$TASK_DEFINITION",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "payloadcms",
      "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/payloadcms:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "REDIS_HOST",
          "value": "$REDIS_ENDPOINT"
        },
        {
          "name": "REDIS_PORT",
          "value": "6379"
        },
        {
          "name": "REDIS_DB",
          "value": "0"
        },
        {
          "name": "CACHE_STRATEGY",
          "value": "redis"
        },
        {
          "name": "ECS_CONTAINER_METADATA_URI_V4",
          "value": "http://169.254.170.2/v4"
        }
      ],
      "secrets": [
        {
          "name": "REDIS_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:redis/auth:password::"
        },
        {
          "name": "DB_PASS",
          "valueFrom": "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:database/password:password::"
        },
        {
          "name": "PAYLOAD_SECRET",
          "valueFrom": "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:payload/secret:secret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$TASK_DEFINITION",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    },
    {
      "key": "Service",
      "value": "payloadcms"
    },
    {
      "key": "Cache",
      "value": "redis"
    }
  ]
}
EOF

# Register new task definition
TASK_DEFINITION_ARN=$(aws ecs register-task-definition \
    --cli-input-json file://task-definition-updated.json \
    --region $REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo -e "${GREEN}✅ Task definition registered: $TASK_DEFINITION_ARN${NC}"

# Step 3: Update ECS service
echo -e "${YELLOW}🔄 Updating ECS service...${NC}"

aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $TASK_DEFINITION_ARN \
    --region $REGION

echo -e "${GREEN}✅ Service updated${NC}"

# Step 4: Wait for deployment to complete
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"

aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $REGION

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Step 5: Test cache functionality
echo -e "${YELLOW}🧪 Testing cache functionality...${NC}"

# Get service URL (assuming you have a load balancer)
SERVICE_URL=$(aws elbv2 describe-load-balancers \
    --region $REGION \
    --query 'LoadBalancers[?contains(LoadBalancerName, `payloadcms`)].DNSName' \
    --output text)

if [ ! -z "$SERVICE_URL" ]; then
    echo -e "${GREEN}🌐 Service URL: http://$SERVICE_URL${NC}"
    
    # Test cache health
    echo -e "${YELLOW}🔍 Testing cache health...${NC}"
    curl -s "http://$SERVICE_URL/api/cache-stats" | jq '.data.info.strategy'
    
    echo -e "${GREEN}✅ Cache test completed${NC}"
else
    echo -e "${YELLOW}⚠️ Could not determine service URL${NC}"
fi

# Step 6: Display monitoring information
echo -e "${GREEN}📊 Monitoring Information:${NC}"
echo -e "ECS Cluster: $CLUSTER_NAME"
echo -e "ECS Service: $SERVICE_NAME"
echo -e "Redis Cluster: $REDIS_CLUSTER_NAME"
echo -e "Redis Endpoint: $REDIS_ENDPOINT"
echo -e "Cache Strategy: Redis"
echo -e ""
echo -e "${YELLOW}🔗 Useful Commands:${NC}"
echo -e "View service logs: aws logs tail /ecs/$TASK_DEFINITION --region $REGION"
echo -e "Check cache stats: curl http://$SERVICE_URL/api/cache-stats"
echo -e "Monitor Redis: aws cloudwatch get-metric-statistics --namespace AWS/ElastiCache --metric-name CacheHits --region $REGION"

echo -e "${GREEN}🎉 ECS deployment with Redis caching completed!${NC}" 