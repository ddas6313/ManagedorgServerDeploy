'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_member(ctx){
        const entry = await strapi.query('individual').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },
    
    async update_member(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithSameEmail = await strapi
            .query('user', 'users-permissions')
            .findOne({ email: ctx.request.body.email.toLowerCase() });

        if(userWithSameEmail != null && userWithSameEmail.individuals[0].id != ctx.request.body.memberId){
            responseData.message = "Email Already Exists";
            return responseData;
        }
        var nameId = userWithSameEmail.names[0].id;
        var mobileId = userWithSameEmail.addon_phone.id;
        var nameUpdate = await strapi.services.names.update({ id: nameId }, {firstName:ctx.request.body.firstName, middleName:ctx.request.body.middleName, lastName:ctx.request.body.lastName});
        var mobileUpdate = await strapi.services.phone.update({ id: mobileId }, {number:ctx.request.body.number});
    
        if(mobileUpdate.isActive){
            responseData.status = 'success';
            responseData.message = 'Member Updated successfully';
            return responseData;
        } else{
            return responseData;
        }
      
    },

    async add_member(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: ctx.request.body.email.toLowerCase() });

        if(userWithSameEmail != null){
            responseData.message = "Email Already Exists";
            return responseData;
        }

        var mobileType = await strapi.query('phone-type').find({ 
            isActive: true,
            name:'Personal'
        });
        var emailType = await strapi.query('email-type').find({ 
            isActive: true,
            name:'Personal'
        });

        var emailData =  await strapi.query('email').create({ 
            email: ctx.request.body.email,
            email_type: emailType[0].id
        });

        var nameData =  await strapi.query('names').create({ 
            firstName: ctx.request.body.firstName,
            middleName: ctx.request.body.middleName,
            lastName: ctx.request.body.lastName,
        });

        var phoneData =  await strapi.query('phone').create({ 
            number: ctx.request.body.number,
            phone_type:mobileType[0].id
        });

        var emailData =  await strapi.query('email').create({ 
            email: ctx.request.body.email,
            email_type: emailType[0].id 
        });

        
        var individualData =  await strapi.query('individual').create({ 
            type: "MEMBER"
        });
        
        var userData = await strapi.plugins['users-permissions'].services.user.add({
            username:ctx.request.body.email,
            email: ctx.request.body.email,
            password: ctx.request.body.number,
            names: [nameData.id],
            addon_email: emailData.id,
            addon_phone: phoneData.id,
            individuals: [individualData.id]
        });

        if(userData.id != undefined){
            responseData.status = 'success';
            responseData.message = 'Member Added successfully';
            return responseData;
        } else{
            return responseData;
        }
        
    },

    
    async add_individual(ctx){
        var responseData ={};
        responseData.message = 'Family Addition Failed';
        responseData.status = 'failed';
        var memberIds = [];

        for (let i = 0; i < ctx.request.body.data.length; i++) {
            var loopData = {};
            loopData = ctx.request.body.data[i];
            var mobileType = await strapi.query('phone-type').find({ 
                isActive: true,
                name:'Personal'
            });
                   
            var emailType = await strapi.query('email-type').find({ 
                isActive: true,
                name:'Personal'
            });
            
            var emailTypeId = '';
            if(emailType == ""){
                var emailType =  await strapi.query('email-type').create({ 
                    isActive: true,
                    name:'Personal'
                });
                emailTypeId = emailType;        
            } else{
                emailTypeId = emailType[0].id;
            }
    
            var nameData =  await strapi.query('names').create({ 
                firstName: loopData.firstName,
                middleName: loopData.middleName,
                lastName: loopData.lastName,
            });
    
            var addressData =  await strapi.query('address').create({ 
                type: 'Home',
                houseNo: loopData.houseNumber,
                street: loopData.street,
                country: loopData.country,
                state: loopData.state,
                city: loopData.city,
            });
    
    
            var phoneTypeId = '';
            if(mobileType == ""){
                var mobileType =  await strapi.query('phone-type').create({ 
                    isActive: true,
                    name:'Personal'
                });
                phoneTypeId = mobileType.id;
            } else{
                phoneTypeId = mobileType[0].id;
    
            }
    
            var phoneData =  await strapi.query('phone').create({ 
                number: loopData.mobilePhone,
                phone_type:phoneTypeId
            });
    
            var emailData =  await strapi.query('email').create({ 
                email: loopData.email,
                email_type: emailTypeId
            });
    
            var individualData =  await strapi.query('individual').create({ 
                type: 'MEMBER',
                relation: loopData.relation,
                gender: loopData.gender,
                homeTown: loopData.khm,
                name: [nameData.id],   
                email: emailData.id,
                phone: phoneData.id,
                address: addressData.id,
            });
            memberIds.push(individualData.id);
        }
        var familyData =  await strapi.query('family').create({ 
            name : ctx.request.body.data[0].firstName + " & Family",
            head : [memberIds[0]],
            members : memberIds
        });
    
        if(familyData.id != undefined){
            responseData.status = 'success';
            responseData.message = familyData.name+' added Successfully';
            responseData.details = familyData;
            return responseData;
        } else{
            return responseData;
        }
        
    }
};
