// netlify/functions/gemini-proxy.js
// هذه الوظيفة تعمل على خوادم Netlify، وليس في متصفح المستخدم

// استيراد مكتبة Google Generative AI Node.js SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// نقطة دخول وظيفة Netlify
exports.handler = async function(event, context) {
    // تأكد أن الطلب هو POST فقط لأغراض الأمان والتحكم
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    // سحب مفتاح API من متغيرات البيئة في Netlify.
    // تم تعيين هذا المتغير في إعدادات موقعك على Netlify.
    const API_KEY = process.env.GEMINI_API_KEY;

    // التحقق مما إذا كان مفتاح API موجوداً
    if (!API_KEY) {
        console.error("GEMINI_API_KEY is not set in Netlify environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API key missing." }),
        };
    }

    // تهيئة نموذج Gemini AI باستخدام المفتاح السري
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // تحليل بيانات الطلب القادمة من الواجهة الأمامية (التي يجب أن تكون JSON)
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        // إذا لم يكن الجسم JSON صالحاً
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON in request body." }),
        };
    }

    const userPrompt = requestBody.prompt; // استخراج سؤال المستخدم

    // التحقق مما إذا كان السؤال موجوداً
    if (!userPrompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing 'prompt' in request body." }),
        };
    }

    try {
        // إعداد التعليمات التي سيتبعها الذكاء الاصطناعي (System Instruction)
        // هذه التعليمات يتم تمريرها مع كل طلب إلى Gemini AI لتوجيه سلوكه.
        const systemInstruction = `أنت مساعد متخصص في هندسة النفط والغاز في موقع PetroCalc. مهمتك هي الإجابة بدقة على أسئلة المستخدمين المتعلقة بحسابات النفط والغاز، مفاهيم المكامن، الحفر، والإنتاج. استخدم معرفتك الهندسية. إذا كان السؤال يتطلب حساباً، اذكر الصيغة المستخدمة وأرشد المستخدم إلى الحاسبة المخصصة في PetroCalc. اجب بإيجاز ودقة باللغة العربية.`;

        // بدء محادثة مع النموذج
        // يمكنك هنا إضافة تاريخ المحادثة إذا كنت تريد أن يتذكر الذكاء الاصطناعي السياق السابق
        // حالياً، كل طلب هو محادثة جديدة، مما يبسط الأمور
        const chat = model.startChat({
            history: [
                // هنا يمكن إضافة سجل المحادثة السابق إذا تم تخزينه في الواجهة الأمامية وإرساله مع كل طلب.
                // مثال: { role: "user", parts: [{ text: "سؤال سابق" }] },
                // { role: "model", parts: [{ text: "إجابة سابقة" }] },
            ],
        });

        // إرسال سؤال المستخدم مع التعليمات إلى Gemini AI
        const result = await chat.sendMessage(systemInstruction + "\n\n" + userPrompt);
        const responseText = result.response.text(); // استخراج النص من استجابة الذكاء الاصطناعي

        // إرجاع الإجابة إلى الواجهة الأمامية
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" }, // تأكد أن نوع المحتوى هو JSON
            body: JSON.stringify({ reply: responseText }), // إرسال الإجابة كـ JSON
        };
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        // إرجاع رسالة خطأ إذا حدثت مشكلة في الاتصال بـ Gemini
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get response from AI. Please check server logs." }),
        };
    }
};