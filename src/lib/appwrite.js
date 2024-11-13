import { Client, Account, Databases, Teams } from 'appwrite'

export const client = new Client()

client
  .setEndpoint('https://aw.mailerfuse.com/v1')
  .setProject('672b9a1f001247e0e8de') // Replace with your project ID

export const account = new Account(client)
export const databases = new Databases(client)
export const teams = new Teams(client)
export { ID, Permission, Role } from 'appwrite'
