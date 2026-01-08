import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';

export interface GraphConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  userEmail: string;
}

export function getGraphConfig(): GraphConfig {
  const config = {
    tenantId: process.env.AZURE_TENANT_ID || '',
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    userEmail: process.env.OUTLOOK_USER_EMAIL || '',
  };

  if (!config.tenantId || !config.clientId || !config.clientSecret || !config.userEmail) {
    throw new Error('Missing required Azure AD configuration. Check your .env file.');
  }

  return config;
}

export async function getGraphClient(): Promise<Client> {
  const config = getGraphConfig();

  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      clientSecret: config.clientSecret,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    
    if (!response || !response.accessToken) {
      throw new Error('Failed to acquire access token');
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, response.accessToken);
      },
    });

    return client;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw error;
  }
}
