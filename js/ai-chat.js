// js/ai-chat.js

// المسار إلى وظيفة Netlify. تأكد من أن هذا المسار صحيح.
// يجب أن يكون مطابقًا للمسار الذي ستنشر عليه وظيفة Netlify الخاصة بك.
// الافتراضي هو /.netlify/functions/اسم_وظيفتك (اسم الملف بدون .js)
const PROXY_URL = '/.netlify/functions/gemini-proxy';

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// إضافة مستمعي الأحداث للأزرار ومربع الإدخال
if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
}
if (userInput) {
    userInput.addEventListener('keypress', function(e) {
        // يرسل عند الضغط على Enter وليس Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // منع سطر جديد في مربع النص
            sendMessage();
        }
    });
}

// دالة إرسال الرسائل إلى الذكاء الاصطناعي
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === "") return; // لا تفعل شيئًا إذا كان مربع النص فارغًا

    // 1. عرض رسالة المستخدم في سجل الدردشة
    const userDiv = document.createElement('p');
    userDiv.innerHTML = `<strong>أنت:</strong> ${userMessage}`;
    chatHistory.appendChild(userDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight; // التمرير التلقائي للأسفل

    userInput.value = ""; // مسح مربع النص بعد الإرسال

    // 2. عرض مؤشر "جاري الكتابة..."
    const typingIndicator = document.createElement('p');
    typingIndicator.innerHTML = `<strong>AI:</strong> جاري الكتابة...`;
    typingIndicator.id = 'typing-indicator'; // تعيين ID لسهولة الوصول إليه لاحقًا
    chatHistory.appendChild(typingIndicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        // 3. إرسال طلب POST إلى وظيفة Netlify proxy
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userMessage }), // إرسال رسالة المستخدم كـ JSON
        });

        // التحقق من أن الاستجابة من الخادم كانت ناجحة (الحالة 200)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const data = await response.json(); // تحليل استجابة JSON
        const aiResponseText = data.reply; // الاستجابة الفعلية من الذكاء الاصطناعي موجودة في خاصية 'reply'

        // 4. إزالة مؤشر "جاري الكتابة..."
        if (document.getElementById('typing-indicator')) {
            document.getElementById('typing-indicator').remove();
        }

        // 5. عرض إجابة الذكاء الاصطناعي في سجل الدردشة
        const aiDiv = document.createElement('p');
        aiDiv.innerHTML = `<strong>AI:</strong> ${aiResponseText}`;
        chatHistory.appendChild(aiDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // التمرير التلقائي للأسفل

    } catch (error) {
        console.error("Error with AI Assistant:", error);
        // إزالة مؤشر "جاري الكتابة..." حتى لو حدث خطأ
        if (document.getElementById('typing-indicator')) {
            document.getElementById('typing-indicator').remove();
        }
        // عرض رسالة خطأ للمستخدم
        const errorDiv = document.createElement('p');
        errorDiv.innerHTML = `<strong>AI:</strong> عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى أو التحقق من اتصالك بالإنترنت. (تفاصيل: ${error.message})`;
        chatHistory.appendChild(errorDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}