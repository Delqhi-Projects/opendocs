# Troubleshooting Guide

This document provides comprehensive troubleshooting information for the OpenDocs application. It covers common issues, diagnostic procedures, recovery strategies, and prevention measures. Use this guide to quickly identify and resolve problems that may arise during normal operation.

## Overview

The OpenDocs platform is a complex system that integrates multiple components including the document editor, database engine, automation system, AI integration layer, and external messaging services. When issues arise, they can stem from any of these layers, and effective troubleshooting requires a systematic approach. This guide organizes problems by category, provides clear diagnostic steps, and offers proven solutions for the most common scenarios encountered by users and administrators.

The troubleshooting process follows a structured methodology: first, identify the symptom and scope of the problem; second, gather relevant logs and diagnostic information; third, isolate the root cause through systematic elimination; fourth, apply the appropriate fix; and fifth, verify that the fix resolves the issue without introducing regressions. Each section in this guide follows this pattern, providing both quick fixes for common issues and detailed diagnostic procedures for complex problems.

Understanding the architecture is essential for effective troubleshooting. The application consists of a frontend client built with modern web technologies, a backend API server handling business logic, a Supabase backend providing database and authentication services, an automation engine processing workflows, and an OpenClaw integration layer for messaging functionality. Problems in any of these areas can manifest with different symptoms, and the troubleshooting steps for each area are distinct. Refer to the architecture documentation for detailed component descriptions and interaction patterns.

## Authentication Issues

Authentication problems represent some of the most common issues users encounter, particularly during initial setup or after configuration changes. These problems can range from simple credential errors to complex session management issues involving token expiration, refresh failures, and cross-origin request complications. Understanding the authentication flow is crucial for diagnosing these problems effectively.

### Login Failures with Invalid Credentials

When users attempt to log in with incorrect credentials, the application returns a 401 Unauthorized error. This error indicates that the provided email and password combination does not match any registered user account in the system. The most common causes include typing errors in the email address, Caps Lock being enabled during password entry, or using credentials from a different environment (such as staging credentials in production).

To resolve this issue, first verify that the email address is entered correctly and matches the address used during account registration. Check for common typos such as transposed characters, missing dots in domain names, or incorrect top-level domains. Second, ensure that Caps Lock is not enabled, as passwords are case-sensitive and the application does not transform input to lowercase. Third, confirm that you are using credentials from the correct environment by checking the URL bar for the environment indicator and verifying the Supabase project URL in your configuration.

If the credentials were correct in the past but login is now failing, the account may have been deactivated, the password may have been reset by an administrator, or the user may have been removed from the organization. Contact your system administrator to verify account status and restore access if necessary. Additionally, check whether the account requires email verification before login, as newly created accounts may need to complete the verification flow before authentication succeeds.

### Session Token Expiration Errors

Session tokens have a limited lifetime for security purposes, and when they expire, users receive authentication errors even with valid credentials. The application is configured to refresh tokens automatically under normal circumstances, but certain conditions can prevent successful refresh: network connectivity issues during the refresh attempt, clock synchronization problems between client and server, or corruption of the token store in the browser.

When encountering session expiration errors, the first step is to verify network connectivity by attempting to access other web resources. If the network is functioning, try clearing the application cache and cookies specifically for the OpenDocs domain, as corrupted local storage can prevent proper token handling. The browser developer tools can be used to examine the Application tab and inspect the local storage entries related to authentication tokens.

For persistent session issues, check the system clock on both client and server machines. Token validation relies on accurate time representation, and even small discrepancies (greater than 60 seconds) can cause validation failures. Synchronize system clocks using NTP services to ensure consistent time across all components. If the problem persists after these steps, the user may need to log out and log back in to establish a fresh session with new tokens.

### OAuth Provider Connection Failures

When configuring OAuth providers such as Google or GitHub for authentication, connection failures can occur during the OAuth handshake process. These failures typically manifest as errors during the redirect flow, where the user is unable to complete authentication with the external provider, or the application fails to exchange the authorization code for access tokens.

The most common cause of OAuth connection failures is incorrect configuration of the OAuth application in the provider's developer console. Verify that the redirect URI in your OAuth provider settings exactly matches the callback URL configured in your OpenDocs environment, including the protocol, domain, port (if non-standard), and path. OAuth providers are strict about redirect URI matching, and any mismatch causes the authentication flow to fail.

Additionally, ensure that the OAuth client ID and client secret are correctly entered in the OpenDocs configuration and that they correspond to the same OAuth application configured in the provider's console. Check that the OAuth application is properly enabled in the provider's settings and that any required APIs or services are activated. Some providers require additional configuration such as enabling specific OAuth scopes or adding authorized JavaScript origins.

Network-level issues can also affect OAuth flows, particularly in corporate environments with restrictive firewalls or proxy servers. If users report OAuth failures specifically, investigate whether the OAuth provider's endpoints are accessible from your network. The OAuth endpoints for common providers are well-documented and should be allowed through any network filtering systems. For GitHub OAuth specifically, ensure that the GitHub API is reachable and that any required rate limits are not being exceeded.

## Database Connection Problems

Database connectivity issues can cause widespread application failures, as nearly all functionality depends on the Supabase backend for data persistence. These problems may manifest as slow responses, complete application failures, or inconsistent data states. Understanding the difference between connection failures, query timeouts, and data inconsistencies is essential for effective diagnosis.

### Connection Timeout Errors

Connection timeout errors occur when the application cannot establish a connection to the Supabase database within the expected time frame. This can result from network connectivity issues, database server overload, incorrect connection credentials, or firewall rules blocking the connection. The error typically presents as a Supabase connection error with specific timeout indicators in the error message.

Begin diagnosis by verifying that the Supabase project URL and API key are correctly configured in your environment variables. Incorrect values here will prevent any connection attempts from succeeding. The Supabase URL should include the project identifier and end with .supabase.co, while the anon key should be a long string starting with eyJh. Use the Supabase dashboard to verify these values match your configuration.

If configuration is correct, test network connectivity to the Supabase endpoint using tools like curl or Postman to send a simple HTTP request to the project URL. Connection failures at this level indicate network issues that may require IT department involvement to resolve. Check that outbound connections to port 443 (HTTPS) are allowed from your application server, and that any proxy or firewall configurations are compatible with Supabase's infrastructure.

For intermittent timeout issues, the problem may be database server overload during peak usage periods. Supabase implements rate limiting and connection pooling that can cause temporary failures under heavy load. Consider implementing exponential backoff retry logic in your application code to handle transient connection issues gracefully. The Supabase status page provides real-time information about service availability and any ongoing incidents that might affect connectivity.

### Query Performance Degradation

Slow database queries can significantly impact application performance, creating poor user experiences and potentially causing timeouts in operations that should complete quickly. Performance degradation can result from missing database indexes, inefficient query patterns, growth in data volume, or resource contention from concurrent operations.

Use the Supabase dashboard's query statistics to identify slow-running queries and analyze their execution plans. Look for queries that perform full table scans instead of index seeks, as these indicate missing indexes or suboptimal query structure. The most common sources of performance problems are queries without WHERE clauses that retrieve entire tables, JOIN operations on columns without foreign key indexes, and ORDER BY operations on non-indexed columns.

Implement database indexes for frequently queried columns, particularly those used in WHERE clauses, JOIN conditions, and ORDER BY operations. Use the Supabase SQL editor to create indexes with the CREATE INDEX statement, specifying the table name, index name, and column expressions to index. For composite indexes supporting multiple query patterns, list columns in order of selectivity, placing the most selective columns first.

Monitor query performance over time to identify trends and catch degradation before it becomes severe. Set up alerting for queries that exceed acceptable performance thresholds, and establish regular review cycles for database performance metrics. Consider implementing query result caching for frequently accessed, rarely changing data to reduce database load and improve response times.

### Data Consistency Issues

Data consistency problems occur when the actual state of data differs from the expected state, often resulting from interrupted operations, race conditions, or bugs in application logic. These issues can be subtle and may not immediately cause errors but can lead to incorrect results, duplicate records, or orphaned relationships between entities.

When data consistency issues are suspected, first check for any recent operations that may have been interrupted, such as document saves, bulk imports, or synchronization processes. Examine the application logs for errors occurring around the time the inconsistency was first noticed, as these often provide clues about the operation that caused the problem.

For foreign key relationship violations, identify orphaned records by querying for parent records that no longer exist. The following SQL query identifies documents with non-existent owner references, which can occur if user accounts are deleted without proper cleanup: SELECT d.id, d.title FROM documents d LEFT JOIN auth.users u ON d.owner_id = u.id WHERE u.id IS NULL AND d.owner_id IS NOT NULL. Similar queries can be written for other relationships in the system.

Address consistency issues by either removing orphaned records, creating missing parent records, or updating references to point to valid entities. Document any consistency issues discovered and their resolutions in an audit log for future reference. Implement prevention measures such as foreign key constraints with ON DELETE CASCADE options and application-level validation to reduce the likelihood of future consistency problems.

## Document Editor Problems

The document editor is the core component of the OpenDocs application, and problems here directly impact user productivity. Editor issues can range from rendering problems and performance degradation to content corruption and synchronization failures. A systematic approach to diagnosis, starting with the simplest possible cause, is most effective.

### Content Not Saving Correctly

Content saving failures can result from client-side JavaScript errors preventing the save operation from initiating, network issues interrupting the save request, server-side validation failures rejecting the save, or database constraint violations preventing persistence. Users may report that edits appear to save but are lost on page refresh, or that save operations fail with explicit error messages.

Begin diagnosis by opening the browser developer tools and examining the console for JavaScript errors occurring during the save attempt. Errors here often indicate bugs in the save implementation, state management problems, or incompatibilities between editor components. Check the Network tab for the save request and verify that it returns a successful status code and expected response format.

If the save request succeeds but content is not persisted, examine the server logs for any errors or warnings occurring during request processing. Database constraint violations, such as exceeding maximum field lengths or violating NOT NULL constraints, can cause saves to fail silently if error handling is incomplete. Verify that all required fields are populated and that content length limits are not being exceeded.

For intermittent save failures, implement client-side logging to capture the save request and response for failed attempts. This diagnostic information is invaluable for identifying patterns such as specific content types, save sizes, or timing conditions that trigger failures. Consider adding retry logic with exponential backoff for transient network issues to improve reliability.

### Editor Rendering Issues

Rendering problems manifest as visual glitches, missing content, incorrect formatting, or complete editor failure. These issues can result from browser compatibility problems, CSS conflicts, JavaScript errors interrupting the rendering pipeline, or corruption of the editor's internal state. The first step in diagnosis is to determine whether the problem is reproducible across different browsers and devices.

Test the editor in an incognito or private browsing window with all extensions disabled, as browser extensions can inject CSS or JavaScript that conflicts with application code. If the problem disappears in this environment, systematically re-enable extensions to identify the conflicting extension. Common culprits include ad blockers, script managers, and styling extensions that apply global changes.

Check for console errors that may be interrupting the rendering process. The editor may fail to initialize properly if required JavaScript bundles fail to load, if there are syntax errors in loaded scripts, or if the editor is initialized with invalid configuration. The browser's Network tab can reveal failed resource loads that prevent proper editor initialization.

For persistent rendering problems, clear the browser cache and application storage for the OpenDocs domain, as corrupted cached resources can cause unpredictable behavior. Hard refresh the page using Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac) to bypass the cache and load fresh resources. If the problem persists, examine the local storage and session storage for any corrupted state that might be interfering with editor operation.

### Synchronization Conflicts

Synchronization conflicts occur when multiple users edit the same document simultaneously and their changes cannot be automatically merged. The application implements operational transformation to handle concurrent edits, but certain conflict patterns can still result in lost work or unexpected merge results. Users typically encounter these issues in collaborative documents with many active participants.

When synchronization conflicts occur, the application should present clear conflict resolution options to the user. If conflict resolution is not functioning correctly, users may see their changes overwritten by other users' edits, or they may be presented with confusing merge options that do not accurately represent the available choices. These problems can result from bugs in the transformation algorithm, network latency causing stale state, or incorrect conflict detection logic.

Examine the WebSocket connection status for real-time synchronization, as conflicts are resolved through this channel. A unstable or disconnected WebSocket can cause the client to operate with stale data, leading to conflicts that should have been avoided. Verify that the WebSocket connection is established successfully and remains connected during editing sessions.

For persistent conflict problems, consider reducing the number of simultaneous editors on a single document or implementing session locks that allow only one user to edit at a time for critical documents. The application should log conflict events for debugging purposes, and these logs can be analyzed to identify specific conflict patterns and their root causes. Work with the development team to identify and fix bugs in the conflict resolution system.

## Automation Engine Failures

The automation engine processes workflows that combine triggers, conditions, and actions to automate repetitive tasks. Automation failures can result from misconfigured triggers, invalid action parameters, dependency service outages, or errors in the automation logic itself. Systematic testing and monitoring are essential for maintaining reliable automation.

### Triggers Not Firing

Automation triggers initiate workflow execution when specific events occur, such as document updates, database changes, or scheduled times. When triggers fail to fire, the entire automation chain does not execute, leaving automated tasks unperformed. Common causes include incorrect trigger configuration, missing event subscriptions, or disabled automation status.

Verify that the automation is enabled in the automation configuration panel. Disabled automations do not respond to triggers regardless of their configuration. Additionally, check that the trigger conditions are properly configured and that the triggering event actually meets those conditions. For example, a trigger configured to fire on document updates in a specific workspace will not fire for updates in other workspaces.

For event-based triggers, confirm that the application is properly subscribing to the relevant event streams. Database triggers require Row Level Security policies to be compatible with the trigger configuration, and webhook triggers require that the webhook endpoint is correctly configured and accessible. Scheduled triggers rely on system clock accuracy and may fail if the server time is significantly skewed.

Examine the automation execution logs to identify any patterns in missed triggers. The logs should indicate when triggers were evaluated and why they did or did not fire. If triggers are firing but not executing the expected actions, the problem likely lies in the action configuration rather than the trigger itself. Compare the trigger configuration with the actual events occurring in the system to identify discrepancies.

### Action Execution Failures

Action failures occur when an automation successfully triggers but cannot complete its configured action. These failures can result from invalid action parameters, permission issues, target service outages, or errors in the action implementation. Each action type has specific failure modes and diagnostic procedures.

For database actions, verify that the target table exists and that the user or service account has appropriate permissions to perform the requested operation. Common issues include attempting to insert data that violates table constraints, updating records that do not exist, or querying with filters that match no results. The database action handler should return detailed error messages that identify the specific failure cause.

Webhook actions can fail due to incorrect endpoint URLs, missing authentication headers, request timeouts, or target server errors. Use a tool like curl or Postman to manually send requests to the webhook endpoint and verify that it responds correctly. Check that the webhook payload format matches what the endpoint expects, and verify that any required authentication tokens or API keys are valid and have not expired.

Email actions require proper SMTP configuration and may fail due to authentication failures, connection problems, or mail server rejections. Verify SMTP credentials and connection settings in the automation configuration. Check that the sending email address is authorized and that the mail server accepts mail from your application IP addresses. Review the mail server logs for any rejection reasons or spam filtering issues.

### Loop Detection and Prevention

Automation loops occur when the output of one action triggers the same automation, creating an infinite execution cycle that can consume resources and cause system instability. The automation engine implements loop detection to identify and halt recursive automation chains, but misconfigurations can bypass these protections or create legitimate use cases that trigger false positives.

When loop detection activates, the automation execution is halted and an error is logged. Users should examine the automation configuration to identify the loop path, which typically involves an action that creates an event that triggers the same automation. Common patterns include document actions that trigger status change workflows, which then update the document and create new change events.

To prevent unintended loops, use conditions that break the trigger chain based on execution context. For example, add a condition that checks whether the triggering user is the automation system itself, preventing automated actions from triggering further automation. Alternatively, use a flag field in the triggering record to track whether processing has already occurred.

If legitimate automation patterns are being incorrectly flagged as loops, review the trigger and action configuration for opportunities to reduce sensitivity. Adding delay actions between potentially recursive steps can help, as can implementing idempotent action logic that handles repeated executions gracefully. Document any legitimate recursive patterns in the automation configuration for future reference.

## AI Integration Issues

The AI integration layer provides intelligent features including text generation, summarization, and semantic search. AI-related issues can involve API connectivity, response quality problems, rate limiting, or configuration errors. Understanding the AI service architecture is important for effective diagnosis.

### API Connection Failures

AI features require connectivity to external AI service providers, and connection failures prevent any AI-powered functionality from working. These failures can result from network issues, incorrect API credentials, service outages, or misconfigured proxy settings. The error messages from AI API failures are typically forwarded from the underlying service and provide clues about the specific cause.

Verify that the AI API keys are correctly configured in the environment variables and that they correspond to the appropriate service tier. Expired or revoked API keys will cause authentication failures, and keys configured for the wrong environment (test versus production) may have restrictions that affect functionality. Check that the API endpoint URLs are correct and that any required custom domains are properly configured.

Network connectivity to AI service endpoints should be tested using standard tools. AI services typically use HTTPS on port 443, and firewalls must allow outbound connections to these endpoints. Corporate networks with proxy requirements may need additional configuration to route AI API traffic correctly. Verify that proxy environment variables are set appropriately for the application runtime.

If connections succeed but operations fail, check the AI service status pages for any ongoing incidents or degraded service levels. AI services implement rate limiting that can cause failures when limits are exceeded. Review usage statistics to ensure that rate limits are not being approached, and implement request queuing or backoff logic to handle rate limit responses gracefully.

### Response Quality Problems

AI response quality issues are more subjective than technical failures and can involve responses that are factually incorrect, stylistically inappropriate, or irrelevant to the prompt. Quality problems may stem from ambiguous prompts, context window limitations, model-specific quirks, or fundamental limitations of the underlying AI technology.

When response quality is unsatisfactory, first examine the prompt structure and clarity. AI models respond to prompt engineering, and poorly constructed prompts often produce poor results. Ensure that prompts include sufficient context, clear instructions, and appropriate examples when using few-shot prompting techniques. The prompt should specify the desired format, tone, and any constraints that apply to the response.

Context window limitations can cause quality degradation in long conversations or when processing large documents. The AI may lose track of earlier context when the conversation exceeds its context capacity, leading to responses that ignore earlier information. Implement context management strategies such as summarizing earlier messages or truncating older content when approaching context limits.

For consistent quality issues that affect all prompts, the problem may be related to model configuration or service degradation. Try alternative models or model configurations to identify whether the issue is specific to one model or general to the AI service. Document specific prompt patterns that produce poor results and work to refine them using established prompt engineering practices.

### Rate Limiting and Quotas

AI services implement rate limiting and usage quotas to manage resource allocation and control costs. When these limits are exceeded, requests are rejected with rate limit errors that should be handled gracefully by the application. Proactive monitoring of usage against limits helps prevent unexpected failures.

Monitor AI service usage through the provider dashboards and configure alerting for approaching limits. The automation engine should implement request queuing and backoff strategies to handle rate limit responses without losing requests. Exponential backoff with jitter prevents thundering herd problems when many requests are rejected simultaneously.

Quota exhaustion typically occurs at predictable times, such as monthly reset dates for quota-based services. Plan for quota management by estimating usage patterns and reserving capacity for critical operations. When quotas are exhausted, identify non-essential AI operations that can be postponed or replaced with simpler alternatives.

Consider implementing usage optimization strategies such as caching frequent AI responses, reducing prompt length where possible, and batching related requests to minimize API calls. These optimizations reduce both costs and the risk of hitting rate limits during peak usage periods.

## Performance Degradation

Performance problems affect user experience and can indicate resource constraints, inefficient code, or system overload. Performance diagnosis requires baseline metrics, systematic profiling, and correlation of symptoms with system conditions. Establish normal performance baselines to identify degradation quickly when it occurs.

### Slow Page Load Times

Page load performance depends on network conditions, server response times, client-side rendering efficiency, and resource delivery optimization. Users experiencing slow page loads should first verify that the issue is consistent across different networks and devices, as local network conditions can significantly affect load times.

Use browser developer tools to analyze the page load waterfall and identify bottlenecks. Look for slow resource downloads, large bundle sizes, excessive JavaScript execution, or blocking network requests that delay page rendering. The Performance tab provides detailed timing information that can pinpoint specific code paths or resources causing delays.

Server-side performance issues manifest as slow API response times regardless of client-side optimization. Monitor server response times and resource utilization (CPU, memory, database connections) to identify bottlenecks. Database queries are a common source of server-side slowdown, and the query analysis procedures described earlier apply here as well.

Implement performance monitoring with synthetic testing that regularly loads pages and measures response times. Configure alerts for performance degradation that exceeds acceptable thresholds. Regular performance testing helps identify regression before users notice and provides data for capacity planning and optimization prioritization.

### Editor Lag and Input Delays

Editor responsiveness is critical for user productivity, and input delays or rendering lag can make the editor unusable. These issues often result from inefficient event handling, memory leaks in long-running sessions, or excessive re-rendering triggered by state changes.

Browser developer tools can profile JavaScript execution and identify long-running functions that block the main thread. Look for event handlers that perform expensive operations, watchers or effects that fire excessively, or rendering logic that processes more data than necessary. The Performance tab provides frame rate visualization that can confirm rendering problems.

Memory leaks accumulate over time in long-running editor sessions, gradually degrading performance until the page becomes unresponsive. Use the Memory tab in developer tools to capture heap snapshots and compare them over time. Increasing heap size between snapshots indicates memory growth that should be investigated and fixed.

For persistent performance issues, try refreshing the editor page, as this clears accumulated state and memory. If performance is acceptable after refresh but degrades over time, the problem is likely a memory leak or state accumulation. Document the specific actions that trigger performance degradation to help developers identify and fix the underlying cause.

### Database Query Slowdowns

Database performance degradation can cause cascading slowdowns throughout the application, as most features depend on database access. Query slowdowns may result from data growth exceeding index capacity, contention from concurrent operations, or infrastructure issues on the Supabase side.

The Supabase dashboard provides query performance statistics that highlight slow-running queries. Focus on queries with high execution times or frequent execution counts, as these have the greatest impact on overall performance. Analyze the query execution plans to identify opportunities for optimization such as adding indexes or rewriting query logic.

Data growth is a common cause of gradual performance degradation. Queries that performed adequately with small datasets may become slow as data volume increases. Implement pagination for list views to limit the number of records returned, and ensure that WHERE clauses filter on indexed columns. Consider archiving historical data that is rarely accessed to maintain query performance.

Connection pool exhaustion can cause query timeouts under high load. Monitor connection pool utilization and consider increasing pool size if connections are consistently exhausted. The Supabase infrastructure may have connection limits that constrain the maximum pool size, and scaling to a larger Supabase plan may be necessary for high-concurrency applications.

## Error Messages Reference

This section provides a comprehensive reference of error messages users may encounter, their meanings, and recommended solutions. Error messages are grouped by category and include both the exact error text and diagnostic procedures for resolution.

### Authentication Errors

Error 401 Unauthorized indicates that the provided credentials are invalid or insufficient for the requested resource. This error occurs when authentication headers are missing, malformed, or rejected by the authentication service. Verify that the authentication token is valid and has not expired. If using API keys, ensure that the key has appropriate permissions for the requested operation.

Error 403 Forbidden indicates that the authenticated user does not have permission to perform the requested operation. Even with valid credentials, insufficient permissions will result in this error. Check the user's role and permissions in the system configuration, and verify that the user has access to the specific resource being requested. Row Level Security policies may be filtering results without error, so verify that policies allow the requested access pattern.

Error 419 Authentication Timeout occurs when the authentication session has expired and requires re-authentication. This typically happens after extended periods of inactivity or when the server-side session has been invalidated. Log out and log back in to establish a fresh session with new credentials.

### Database Errors

Error PGRST301: Relation does not exist indicates that the requested database table or view cannot be found. This error occurs when the table name is misspelled, the table has not been created in the database, or the search path does not include the correct schema. Verify that migrations have been applied and that the table exists in the expected schema.

Error PGRST302: Could not find a relationship indicates that a foreign key relationship referenced in the query does not exist. This error occurs when attempting to use .related() on a column that is not a foreign key, or when the referenced table does not exist. Check the table schema to verify foreign key relationships and correct any misconfigured queries.

Error PGRST400: Payload too large indicates that the request body exceeds the maximum allowed size. This typically occurs when inserting or updating large documents or BLOBs. Implement pagination or chunking for large data operations, and verify that the request size is within configured limits.

Error 406 Not Acceptable occurs when the request headers specify an unsupported content type or accept format. Verify that request headers specify supported content types and that the Accept header matches the expected response format.

### Automation Errors

Error AUTO001 Trigger condition not met indicates that the trigger fired but the condition evaluation returned false. The automation executed but did not proceed to action execution. Review the condition logic and verify that the triggering event meets the condition requirements.

Error AUTO002 Action execution failed indicates that an action returned an error during execution. The specific error message provides details about the failure. Refer to the action-specific error sections for diagnosis procedures.

Error AUTO003 Maximum recursion depth exceeded indicates that loop detection has halted an automation due to suspected recursive execution. Review the automation configuration for recursive patterns and add conditions or flags to prevent unintended recursion.

Error AUTO004 Dependency service unavailable indicates that an external service required for action execution is not accessible. This commonly occurs with webhook targets, email servers, or database connections that the automation depends on. Verify the availability of the external service and check network connectivity.

### API Errors

Error 400 Bad Request indicates that the request body is malformed or missing required fields. The error message typically includes details about which part of the request is invalid. Validate the request body against the API schema and correct any structural or content issues.

Error 404 Not Found indicates that the requested resource does not exist. Verify that the resource ID in the URL is correct and that the resource has not been deleted. Check that the API version in the URL matches the expected version for the resource type.

Error 422 Unprocessable Entity indicates that the request is syntactically correct but semantically invalid. This typically occurs when validation rules reject the request content. The error response includes validation error details that identify which fields are invalid and why.

Error 429 Too Many Requests indicates that rate limiting has been applied and the request was rejected. Implement exponential backoff and retry the request after the indicated retry period. Monitor usage to prevent future rate limit violations.

## Recovery Procedures

Recovery procedures provide step-by-step instructions for restoring normal operation after various failure scenarios. These procedures assume that basic system components (network, server, database) are functioning and that the issue is specific to the application layer.

### Restoring Corrupted Documents

Document corruption can result from interrupted save operations, bugs in the editor, or underlying storage issues. When a document appears corrupted, first check the document version history to restore a previous version if available. The version history feature maintains snapshots of document states that can be used for recovery.

If version history is not available or does not contain a usable version, examine the document content to identify what specific corruption exists. Common corruption patterns include truncated content, scrambled character encoding, or missing structural elements. Document the corruption pattern for later analysis and prevention.

As a last resort, recreate the document by creating a new document and copying content from the corrupted version manually. This preserves any data that survived the corruption while allowing normal operation to resume. After recovery, investigate the root cause to prevent recurrence.

### Resetting User Session State

User session state corruption can cause various issues including authentication failures, preference loss, or unexpected application behavior. Resetting the session state involves clearing browser storage and re-establishing the session from server-side data.

Guide the user to open the browser developer tools, navigate to the Application tab, and clear all storage for the OpenDocs domain. This includes local storage, session storage, cookies, and indexed databases. After clearing storage, the user should log out and log back in to establish a fresh session.

If the problem persists after client-side state reset, the issue may be server-side session data. An administrator can view the user's session records and delete problematic sessions if necessary. This forces the user to re-authenticate and establishes a clean session state from scratch.

### Recovering from Automation Runaway

Automation runaway occurs when an automation executes excessively, consuming resources or creating unwanted data. The immediate response is to disable the problematic automation to stop further execution. Navigate to the automation configuration, locate the automation, and set its status to disabled.

After stopping the runaway automation, assess the damage by examining what data was created or modified. Database actions may have inserted duplicate records or modified existing records in unwanted ways. Prepare the necessary cleanup operations based on what the automation was configured to do.

When the environment is stable, investigate the root cause of the runaway condition. Common causes include missing loop prevention conditions, incorrect trigger configurations, or external systems that repeatedly invoke the automation. Fix the configuration before re-enabling the automation, and implement additional monitoring to detect similar issues earlier.

## Prevention Strategies

Prevention is more effective than remediation. Implementing the strategies in this section reduces the likelihood and impact of common problems. These measures should be incorporated into standard operating procedures and regular maintenance routines.

### Regular Data Backups

Implement automated database backups with appropriate retention policies. The Supabase platform provides point-in-time recovery capabilities that should be supplemented with regular exported snapshots for disaster recovery. Test backup restoration procedures regularly to verify that backups are usable.

Document backup procedures and assign responsibility for backup verification. Backups that have never been tested may be unusable when needed most. Schedule regular restoration tests to verify backup integrity and document the restoration process for emergency use.

Maintain multiple backup copies in separate locations to protect against location-specific failures. Cloud storage with versioning provides additional protection against accidental deletion or corruption of backup files. Monitor backup job success and alert on failures to ensure consistent protection.

### Monitoring and Alerting

Configure comprehensive monitoring for all system components including application performance, database metrics, and external service availability. Establish baseline metrics during normal operation and configure alerts for deviations that indicate potential problems. Effective alerting catches issues before they impact users.

Monitor error rates and log patterns to identify emerging problems before they become widespread. Implement log aggregation and analysis tools to surface important events from the volume of routine logs. Configure alerts for specific error patterns that indicate known problem categories.

Set up synthetic monitoring that periodically exercises key user paths and verifies expected behavior. Synthetic tests run from controlled environments and can detect problems that real-user monitoring might miss. Configure synthetic tests to run at regular intervals and alert on failures.

### Security Best Practices

Implement security measures to prevent unauthorized access and data breaches. Enforce strong authentication policies, implement least-privilege access controls, and regularly review permissions assignments. Security vulnerabilities can cause operational problems and serious data exposure.

Keep all system components updated with security patches. Establish a patch management process that balances security urgency against stability requirements. Critical security patches should be applied urgently, while routine updates can be scheduled during maintenance windows.

Conduct regular security reviews and penetration testing to identify vulnerabilities before attackers discover them. Address findings systematically and track remediation progress. Security findings often surface operational issues that should be fixed regardless of security implications.

## Getting Help

When troubleshooting procedures do not resolve an issue, additional support resources are available. The following options provide escalating levels of support for different problem categories and organizational contexts.

For documentation-related questions, consult the user guide and API documentation for detailed information about feature behavior and configuration options. The documentation is regularly updated and contains answers to many common questions. Search the documentation before contacting support to find immediate answers.

For issues requiring technical support, gather relevant diagnostic information before contacting the support team. This includes error messages, browser console output, network request traces, and steps to reproduce the problem. Comprehensive diagnostic information enables faster resolution.

For feature requests or product feedback, submit requests through the designated feedback channel. Feature requests are evaluated based on customer impact, technical feasibility, and alignment with product strategy. Submissions should clearly articulate the use case and expected behavior to facilitate evaluation.

For urgent production issues that require immediate assistance, contact the emergency support line. Urgent issues include complete service outages, data loss or corruption, security breaches, or issues affecting critical business operations. Emergency support is reserved for situations that cannot wait for standard response times.

## Appendix A Diagnostic Commands

This appendix provides quick reference commands for collecting diagnostic information. These commands are useful for both self-diagnosis and when preparing information for support requests.

The following curl command tests basic connectivity to the application API endpoint, replacing the URL with the appropriate environment endpoint: curl -I https://your-domain.supabase.co/api/v1/health. A successful response indicates that the network path to the API is functional and that the server is accepting connections.

The following command retrieves recent error logs from the application, filtering for error severity entries: npm run logs -- --level=error --limit=100. Adjust the limit parameter to retrieve more or fewer entries as needed for the specific investigation.

The following Supabase SQL query identifies the largest tables by record count, useful for performance analysis: SELECT schemaname, tablename, n_live_tup AS approximate_row_count FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20. Tables with very high row counts may require pagination or archiving strategies.

## Appendix B Log Format Reference

Application logs follow a structured format that facilitates automated parsing and analysis. Understanding the log format helps in locating relevant entries and interpreting their content.

Each log entry includes a timestamp indicating when the entry was created, formatted in ISO 8601 with millisecond precision and timezone offset. The timestamp provides the primary ordering for log analysis and enables correlation of events across different system components.

Log entries include a severity level indicating the importance of the entry, with standard levels including DEBUG, INFO, WARN, ERROR, and FATAL. Filtering by severity level helps focus on relevant entries while ignoring routine operational noise.

Context fields provide additional information about the operation being logged, including user identifiers, request identifiers, resource identifiers, and operation types. These fields enable tracing individual requests through the system and aggregating logs by various dimensions.

## Appendix C Configuration Checklist

This checklist summarizes the configuration requirements for a healthy OpenDocs deployment. Review this checklist during initial setup and periodically verify that configuration remains correct.

Environment variables should include SUPABASE_URL with the project URL, SUPABASE_ANON_KEY with the anonymous API key, and any AI provider API keys with appropriate scopes. Verify that these values are correctly set and that they correspond to the expected environment.

Database Row Level Security policies should be configured for all tables with appropriate policies for select, insert, update, and delete operations. Policies should follow the principle of least privilege, granting only the minimum access required for each role.

Automation configuration should include valid trigger conditions, properly configured action parameters, and appropriate error handling. Automations should be tested after configuration changes and monitored for unexpected behavior during initial deployment.

## Revision History

| Version | Date       | Description                            |
| ------- | ---------- | -------------------------------------- |
| 1.0     | 2024-01-15 | Initial documentation                  |
| 1.1     | 2024-02-20 | Added AI integration troubleshooting   |
| 1.2     | 2024-03-10 | Added performance diagnosis procedures |
| 1.3     | 2024-04-05 | Expanded recovery procedures           |
| 1.4     | 2024-05-15 | Added error message reference appendix |
