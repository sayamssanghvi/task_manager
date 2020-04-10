const sgMail=require('@sendgrid/mail');

const sendGridAPIKey=process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);

const senWelcomeEmail=(email,name)=>{
    sgMail.send({
        to: email,
        from: "s3sanghvi@gmail.com",
        subject: "Welcome to World  of SRMStud life",
        text: `Hope you are doing good ${name}. If you have and queries or feedback regarding the app please do share with us`
      });
}

const sendLeavingEmail=(email,name)=>{
    sgMail.send({
      to:email,
      from:'s3sanghvi@gmail.com',
      subject:'What went wrong',
      text:`Hello ${name},hope you are doing good. We  have recently learnt that you have choosen to unsubscribe to our API services and we feel bad that you had to leave us.If you have any feedback regardiing `
    })
}

module.exports={
  senWelcomeEmail,
  sendLeavingEmail
}