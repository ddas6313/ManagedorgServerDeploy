module.exports = ({ env }) => ({
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: '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',
    },
    settings: {
      defaultFrom: 'areghunath@sreyo.com',
      defaultReplyTo: 'areghunath@sreyo.com',
      testAddress: 'areghunath@sreyo.com',
    },
  },
});