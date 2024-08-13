import 'dotenv/config'
import axios from 'axios'

const getAdmiralScript = async (publication, environment) => {
  let pubId = process.env[publication]
  const response = axios({
    method: 'get',
    url: `https://delivery.api.getadmiral.com/script/${pubId}/bootstrap?environment=${environment}`,
  })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      if (error.response) {
        return {
          error: {
            status: error.response.status,
            data: error.response.data,
          },
        }
      } else {
        return 'Error', error.message
      }
    })
  return response
}

export const handler = async (event) => {
  if (event === undefined) {
    return {
      status: 401,
      message: 'malformed event',
    }
  }
  if (
    event.queryParams.publication === undefined ||
    event.queryParams.publication === null ||
    event.queryParams.publication === ''
  ) {
    return {
      status: 401,
      message: 'Invalid Publication',
    }
  }
  if (
    event.queryParams.environment === undefined ||
    event.queryParams.environment === null ||
    event.queryParams.environment === ''
  ) {
    return {
      status: 401,
      message: 'Invalid environment',
    }
  }
  const admiral = await getAdmiralScript(
    event.queryParams.publication,
    event.queryParams.environment
  )
  return admiral
}
