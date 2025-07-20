export const getServerSideURL = () => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  return 'http://localhost:3001'
}

export const getClientSideURL = () => {}
