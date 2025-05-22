# Security Policy

## Supported Versions

We currently support the following versions of Google Calendar Widget with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of Google Calendar Widget seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email the details to security@example.com** (replace with your actual security contact)
   - Provide a detailed description of the vulnerability
   - Include steps to reproduce the issue
   - Attach any proof-of-concept code if applicable
   - Let us know your estimated severity level
3. **Allow time for response and resolution**
   - We aim to acknowledge receipt within 48 hours
   - We'll provide regular updates on our progress
   - Once the issue is resolved, we'll coordinate disclosure

## Security Measures

This plugin implements several security measures:

1. **Input Validation and Sanitization**

   - All user inputs are validated and sanitized
   - WordPress security functions are used throughout the codebase

2. **Output Escaping**

   - All output is properly escaped to prevent XSS attacks
   - Context-appropriate escaping functions are used

3. **Dependency Management**

   - Dependabot monitors dependencies for vulnerabilities
   - Regular updates to address security issues

4. **Code Reviews**
   - All code changes undergo security review
   - CODEOWNERS file ensures proper review process

## Security Best Practices for Users

1. **Keep the Plugin Updated**

   - Always use the latest version of the plugin
   - Subscribe to release notifications

2. **API Key Security**

   - Restrict your Google API key to specific domains
   - Limit API key usage to only the Google Calendar API

3. **WordPress Security**
   - Keep WordPress core, themes, and plugins updated
   - Use strong passwords and two-factor authentication
   - Consider a security plugin for additional protection

## Acknowledgments

We would like to thank the following individuals for responsibly disclosing security issues:

- (This section will be updated as security researchers report issues)

## Changes to This Policy

We may update this security policy as our security practices evolve. Please check back periodically for updates.

Last updated: April 6, 2025
