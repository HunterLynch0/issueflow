package com.lynch.issuetrackerapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String recipient, String token) {
        String link = "http://localhost:5173/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject("Verify your IssueFlow account");
        message.setText("Click this link to verify your account: " + link);

        mailSender.send(message);
    }

}
