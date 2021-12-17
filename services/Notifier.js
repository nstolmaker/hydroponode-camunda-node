const nodemailer = require('nodemailer')
require('dotenv').config()

class Notifier {
  constructor() {
	  this.mailing = false;
	  this.transporter = nodemailer.createTransport({
	    service: 'SendPulse', // no need to set host or port etc.
	    auth: {
        user: process.env.SENDPULSE_EMAIL,
        pass: process.env.SENDPULSE_PASSWORD
	    }
	  });

	  this.message = {
	    from: "noah@chromaplex.io",
	    to: process.env.SENDPULSE_EMAIL,
	    subject: "🚨 [Hydroponode Notice]",
	    text: "not set" 
	  };
  }


  async sendNotification(message) {
		console.log(`[${new Date().toLocaleString()}] sendNotification called. You should have an email.`);
		this.mailing = true;
		console.warn("🚨 "+message)
		this.message.text = message;
		this.transporter.sendMail(this.message, 
			(err) => { 
				this.mailing = false;
				// console.log("sendNotification completed. mailing is: ", this.mailing);
			}
		);
	}
}

module.exports = Notifier