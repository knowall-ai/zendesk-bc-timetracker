/**
 * Zendesk Service - ZAF Client API wrapper
 */

let client = null;

export const initializeClient = () => {
  if (typeof ZAFClient !== 'undefined') {
    client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '400px' });
    return client;
  }
  return null;
};

export const getClient = () => client;

export const zdService = {
  /**
   * Get the current agent information
   */
  async getCurrentAgent() {
    if (!client) throw new Error('ZAF Client not initialized');
    
    const context = await client.context();
    const currentUser = await client.get('currentUser');
    
    return {
      id: currentUser.currentUser.id,
      email: currentUser.currentUser.email,
      name: currentUser.currentUser.name,
      subdomain: context.account.subdomain,
    };
  },

  /**
   * Get the current ticket information
   */
  async getTicket() {
    if (!client) throw new Error('ZAF Client not initialized');
    
    const ticketData = await client.get('ticket');
    return ticketData.ticket;
  },

  /**
   * Get the full ticket URL
   */
  async getTicketUrl() {
    if (!client) throw new Error('ZAF Client not initialized');
    
    const context = await client.context();
    const ticket = await this.getTicket();
    
    return `https://${context.account.subdomain}.zendesk.com/agent/tickets/${ticket.id}`;
  },

  /**
   * Get app settings from manifest parameters
   */
  async getSettings() {
    if (!client) throw new Error('ZAF Client not initialized');
    
    const metadata = await client.metadata();
    return metadata.settings;
  },

  /**
   * Show a notification to the user
   */
  notify(message, type = 'notice') {
    if (!client) return;
    client.invoke('notify', message, type);
  },

  /**
   * Resize the app iframe
   */
  resize(height) {
    if (!client) return;
    client.invoke('resize', { width: '100%', height: `${height}px` });
  },
};

export default zdService;
