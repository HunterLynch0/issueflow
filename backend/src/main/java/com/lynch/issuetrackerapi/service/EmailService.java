package com.lynch.issuetrackerapi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void sendVerificationEmail(String recipient, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;

        String jsonBody = """
                {
                  "from": "%s",
                  "to": ["%s"],
                  "subject": "Verify your IssueFlow account",
                  "html": "<h2>Verify your IssueFlow account</h2><p>Click the link below to verify your account:</p><p><a href='%s'>Verify account</a></p>"
                }
                """.formatted(escapeJson(fromEmail), escapeJson(recipient), escapeJson(link));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            if(response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Failed to send verification email");
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email" , e);
        }
    }

    private String escapeJson(String value) {
        return value == null ? "" : value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

}
