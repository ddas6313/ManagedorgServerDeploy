'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    // async client_token(ctx){
    //     var braintree = require('braintree');
    //     var gateway = new braintree.BraintreeGateway({
    //         environment:  braintree.Environment.Production,
    //         merchantId:   'vpq8zpfp6qhcztfk',
    //         publicKey:    'hny9q5hdcxpjc2b8',
    //         privateKey:   '1d97c15ea7952d841c30815527a21cc0'
    //     });
    //     let token = (await gateway.clientToken.generate({})).clientToken;
    //     var invoiceData = await strapi.query('invoice').find({ 
    //         isActive: true,
    //         family:ctx.state.user.family,
    //         isPaid: false
    //     });
        
    //     var passData = {};
    //     passData['token'] = token;
    //     passData['invoiceData'] = invoiceData;
    //     return passData;

    // },

    async client_token(ctx){
        var invoiceDataFetch = await strapi.query('invoice').find({ 
            isActive: true,
            id:ctx.request.body.id
        });

        var invoiceData = {};
        if(!invoiceDataFetch[0].isPaid){
            invoiceData.amount = invoiceDataFetch[0].amount;
            invoiceData.invoiceNo = invoiceDataFetch[0].invoiceNo;
            invoiceData.isPaid = invoiceDataFetch[0].isPaid;
            invoiceData.date = invoiceDataFetch[0].date;
            invoiceData.description = invoiceDataFetch[0].description;
            invoiceData.familyName = invoiceDataFetch[0].family.name;
            invoiceData.invId = invoiceDataFetch[0].id;
        } else{
            invoiceData.isPaid = invoiceDataFetch[0].isPaid;
        }
        
        return invoiceData;

    },

    async make_payment(ctx) {
        var braintree = require('braintree');
        var gateway = new braintree.BraintreeGateway({
            environment:  braintree.Environment.Sandbox,
            merchantId:   'mj8f8x9ngw7hcdxy',
            publicKey:    'vsqyp29hg3q9tc45',
            privateKey:   'fea98c1a4b86df8a31bae7a1853fc7f4'
        });
        return new Promise(function (resolve, reject) {
            gateway.transaction.sale({
                amount: ctx.request.body.amount,
                paymentMethodNonce: ctx.request.body.nonce,
                options: {
                  submitForSettlement: true
                }
              }).then(
                (response) => {
                    console.log(response);
                    var result = response;
                    var tranStatus = 'PENDING';
                    if(response.success === true){
                        tranStatus = 'SUCCESS';
                        strapi.query('invoice').update({id:ctx.request.body.invId},{ 
                            isPaid: true
                        });
                    } else{
                        tranStatus = 'FAILED';
                        resolve(result);
                    }
                    strapi.query('receipt').create({ 
                        status: tranStatus,
                        invoice: ctx.request.body.invId,
                        amount: ctx.request.body.amount,
                        transactionId: response.transaction.id,
                        date: response.transaction.createdAt
                    });

                    resolve(result);
                    
                
                    // var emailSub = 'PENDING';
                    // var emailBody = 'PENDING';
                    // var emailClient = 'PENDING';
                    // var emailOur = 'areghunath@sreyo.com';
                    // strapi.plugins['email'].services.email.send({
                    //     to: 'akarsh.reghunath@gmail.com',
                    //     from: 'areghunath@sreyo.com',
                    //     replyTo: 'akarsh.reghunath@gmail.com',
                    //     subject: 'Use strapi email provider successfully',
                    //     text: 'Hello world!',
                    //     html: 'Hello world!',
                    // });
                },
                    (error) => {
                    reject(error);
                }
            );
        });
    },

};
