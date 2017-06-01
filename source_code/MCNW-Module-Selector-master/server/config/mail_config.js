var nodemailer = require('nodemailer');

/**
 *@module Mail Config
 */

/**
 * Class handling the sending of email to users when they require a reset
 * of their password.
 */

/**
 * Function to send a reset password email to the user. 
 * Can specify either text or html.
 * @param {string} text - The text to be sent to the user in the email.
 * @param {string} html - The html to be sent to the user in the email.
 * @param {string} userAddress - The user's email.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
function handleMail(text, html, userAddress, callback) {
    
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USER ||'moduleselectionnoreply@gmail.com',
            pass: process.env.MAIL_PASSWORD || 'C:jdP2k2&&%rF]]!' 
        }
    });

		var mailOptions = {
				from: 'moduleselectionnoreply@gmail.com', 
				to: userAddress, 
				subject: 'Password Reset' 	
		};
		
		text ? mailOptions.text = text : mailOptions.html = html;		

		transporter.sendMail(mailOptions, function(err, info){
		  if(err){
		      callback(err);
		  }else{
		      callback(null,info.response);
		  };
		});
    
}


exports.handleMail = handleMail;
