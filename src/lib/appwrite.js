import { Client, Account } from 'appwrite'

export const client = new Client()

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('672b9a1f001247e0e8de') // Replace with your project ID

export const account = new Account(client)
export { ID } from 'appwrite'
