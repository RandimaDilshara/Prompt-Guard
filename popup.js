// Mock data for demonstration
const mockDetectionLog = [
    { timestamp: "2023-05-15 14:32", text: "User entered credit card number pattern" },
    { timestamp: "2023-05-15 13:45", text: "Potential social security number detected" },
    { timestamp: "2023-05-15 12:18", text: "Password pattern identified in prompt" },
    { timestamp: "2023-05-15 11:05", text: "Bank account information pattern detected" },
    { timestamp: "2023-05-15 10:30", text: "Phone number pattern identified" }
];

// DOM elements
const detectionLogBtn = document.getElementById('detection-log');
const logContainer = document.getElementById('log-container');
const closeLogBtn = document.getElementById('close-log');
const logEntries = document.getElementById('log-entries');
const toggleSwitch = document.getElementById('protection-toggle');

// Event listeners
detectionLogBtn.addEventListener('click', showDetectionLog);
closeLogBtn.addEventListener('click', hideDetectionLog);
toggleSwitch.addEventListener('change', toggleProtection);

// Show detection log
function showDetectionLog() {
    // Clear previous entries
    logEntries.innerHTML = '';
    
    // Add entries to log
    mockDetectionLog.forEach(entry => {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <div class="log-time">${entry.timestamp}</div>
            <div class="log-text">${entry.text}</div>
        `;
        logEntries.appendChild(logEntry);
    });
    
    // Show the log container with animation
    logContainer.style.display = 'block';
    setTimeout(() => {
        logContainer.style.opacity = '1';
        logContainer.style.transform = 'translateY(0)';
    }, 10);
}

// Hide detection log
function hideDetectionLog() {
    logContainer.style.opacity = '0';
    logContainer.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        logContainer.style.display = 'none';
    }, 300);
}

// Toggle protection status
function toggleProtection() {
    const statusText = document.querySelector('.status-text');
    const statusIcon = document.querySelector('.status-icon');
    
    if (toggleSwitch.checked) {
        statusText.textContent = 'Protection Active';
        statusText.style.color = '#4cc9f0';
        statusIcon.style.background = 'linear-gradient(135deg, #4cc9f0, #4361ee)';
        
        // Show a brief confirmation
        showNotification('Protection enabled', 'success');
    } else {
        statusText.textContent = 'Protection Paused';
        statusText.style.color = '#f8961e';
        statusIcon.style.background = 'linear-gradient(135deg, #f8961e, #f72585)';
        
        // Show a warning
        showNotification('Protection paused - sensitive data may be exposed', 'warning');
    }
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Add informational tooltips
document.getElementById('how-it-works').addEventListener('click', function() {
    showNotification('Prompt Guard scans inputs using keyword matching and regex patterns to detect sensitive information.', 'success');
});

document.getElementById('upgrade-idea').addEventListener('click', function() {
    showNotification('Future versions will use ML for contextual awareness and better detection accuracy.', 'success');
});

// Initialize with some styles for animation
logContainer.style.opacity = '0';
logContainer.style.transform = 'translateY(-10px)';
logContainer.style.transition = 'opacity 0.3s, transform 0.3s';