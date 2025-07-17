import type { CollectionConfig } from 'payload'

export const ApiSyncLogs: CollectionConfig = {
  slug: 'api-sync-logs',
  admin: {
    useAsTitle: 'sync_id',
    defaultColumns: ['sync_id', 'status', 'started_at', 'completed_at', 'records_processed'],
    description: 'Track external API sync operations',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'sync_id',
      type: 'text',
      label: 'Sync ID',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for this sync operation',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: [
        { label: 'Running', value: 'RUNNING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Partially Completed', value: 'PARTIAL' },
      ],
      defaultValue: 'RUNNING',
    },
    {
      name: 'started_at',
      type: 'date',
      label: 'Started At',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completed_at',
      type: 'date',
      label: 'Completed At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'duration_seconds',
      type: 'number',
      label: 'Duration (seconds)',
      admin: {
        description: 'How long the sync took to complete',
      },
    },
    {
      name: 'external_api_url',
      type: 'text',
      label: 'External API URL',
      required: true,
    },
    {
      name: 'api_response_summary',
      type: 'group',
      label: 'API Response Summary',
      fields: [
        {
          name: 'total_records_fetched',
          type: 'number',
          label: 'Total Records Fetched',
          defaultValue: 0,
        },
        {
          name: 'total_pages',
          type: 'number',
          label: 'Total Pages',
          defaultValue: 0,
        },
        {
          name: 'last_page_processed',
          type: 'number',
          label: 'Last Page Processed',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'processing_summary',
      type: 'group',
      label: 'Processing Summary',
      fields: [
        {
          name: 'records_processed',
          type: 'number',
          label: 'Records Processed',
          defaultValue: 0,
        },
        {
          name: 'records_created',
          type: 'number',
          label: 'Records Created',
          defaultValue: 0,
        },
        {
          name: 'records_updated',
          type: 'number',
          label: 'Records Updated',
          defaultValue: 0,
        },
        {
          name: 'records_failed',
          type: 'number',
          label: 'Records Failed',
          defaultValue: 0,
        },
        {
          name: 'shops_processed',
          type: 'number',
          label: 'Shops Processed',
          defaultValue: 0,
        },
        {
          name: 'dinings_processed',
          type: 'number',
          label: 'Dinings Processed',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'validation_issues',
      type: 'array',
      label: 'Validation Issues',
      fields: [
        {
          name: 'record_unique_id',
          type: 'text',
          label: 'Record Unique ID',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
      ],
    },
    {
      name: 'unmapped_data',
      type: 'group',
      label: 'Unmapped Data',
      fields: [
        {
          name: 'unmapped_floors',
          type: 'array',
          label: 'Unmapped Floor Names',
          fields: [
            {
              name: 'floor_name',
              type: 'text',
              label: 'Floor Name',
            },
          ],
        },
        {
          name: 'unmapped_categories',
          type: 'array',
          label: 'Unmapped Category Names',
          fields: [
            {
              name: 'category_name',
              type: 'text',
              label: 'Category Name',
            },
            {
              name: 'type',
              type: 'select',
              label: 'Type',
              options: [
                { label: 'Shops', value: 'shops' },
                { label: 'Dinings', value: 'dinings' },
              ],
            },
            {
              name: 'english_name',
              type: 'text',
              label: 'English Name',
            },
            {
              name: 'thai_name',
              type: 'text',
              label: 'Thai Name',
            },
          ],
        },
      ],
    },
    {
      name: 'errors',
      type: 'array',
      label: 'Errors',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          label: 'Timestamp',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'record_unique_id',
          type: 'text',
          label: 'Record Unique ID',
        },
        {
          name: 'error_message',
          type: 'textarea',
          label: 'Error Message',
        },
        {
          name: 'error_stack',
          type: 'textarea',
          label: 'Error Stack Trace',
        },
      ],
    },
    {
      name: 'performance_metrics',
      type: 'group',
      label: 'Performance Metrics',
      fields: [
        {
          name: 'avg_time_per_record',
          type: 'number',
          label: 'Average Time Per Record (ms)',
        },
        {
          name: 'memory_usage_mb',
          type: 'number',
          label: 'Memory Usage (MB)',
        },
        {
          name: 'api_response_time_avg',
          type: 'number',
          label: 'Average API Response Time (ms)',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Additional notes about this sync operation',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate duration if both dates are present
        if (data.started_at && data.completed_at) {
          const startTime = new Date(data.started_at).getTime()
          const endTime = new Date(data.completed_at).getTime()
          data.duration_seconds = Math.round((endTime - startTime) / 1000)
        }
        return data
      },
    ],
  },
}
