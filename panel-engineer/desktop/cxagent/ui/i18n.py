"""English / Arabic interface text. Arabic switches the whole layout to right-to-left.
Technical names (apps, files, tags, menus) are never translated."""

from __future__ import annotations

_T: dict[str, tuple[str, str]] = {
    "app_title": ("Panel Engineer", "مهندس اللوحات"),
    "username": ("Username", "اسم المستخدم"),
    "password": ("Password", "كلمة المرور"),
    "login": ("Sign in", "تسجيل الدخول"),
    "login_failed": ("Sign-in failed", "تعذّر تسجيل الدخول"),
    "secure_note": ("Encrypted connection · bound to this device", "اتصال مشفّر · مربوط بهذا الجهاز"),
    "emergency_stop": ("EMERGENCY STOP", "إيقاف طوارئ"),
    "whatsapp": ("WhatsApp", "واتساب"),
    "settings": ("Settings", "الإعدادات"),
    "logout": ("Sign out", "خروج"),
    # status
    "Idle": ("Ready", "جاهز"),
    "Working": ("Agent working", "الوكيل يعمل"),
    "Paused": ("Paused", "متوقف مؤقتاً"),
    "Stopped": ("Stopped", "تم الإيقاف"),
    "Waiting for you": ("Waiting for you", "بانتظارك"),
    "Task complete": ("Task complete", "اكتملت المهمة"),
    "Step limit reached": ("Step limit reached", "تم بلوغ حد الخطوات"),
    "Connection lost, work paused.": ("Connection lost, work paused.", "انقطع الاتصال، العمل متوقف مؤقتاً."),
    "Approval needed": ("Approval needed", "بانتظار موافقتك"),
    # panels
    "projects": ("PROJECTS", "المشاريع"),
    "new_project": ("+ New project", "+ مشروع جديد"),
    "edit": ("Edit", "تعديل"),
    "chat": ("AGENT CHAT", "المحادثة مع الوكيل"),
    "live_log": ("LIVE LOG", "سجل العمل المباشر"),
    "outputs": ("OUTPUT FILES", "ملفات المشروع"),
    "type_task": ("Describe the task, or reply to the agent…", "اكتب المهمة أو رد على الوكيل…"),
    "start": ("Start", "ابدأ"),
    "send": ("Send", "إرسال"),
    "pause": ("Pause", "إيقاف مؤقت"),
    "continue": ("Continue", "متابعة"),
    "stop": ("Stop", "إيقاف"),
    "new_task": ("New task", "مهمة جديدة"),
    "attach": ("Attach files (PDF, images, Excel)", "إرفاق ملفات (PDF، صور، Excel)"),
    "voice": ("Speak (Windows voice typing)", "تحدّث (الكتابة الصوتية في ويندوز)"),
    "no_project": ("Open or create a project first.", "افتح مشروعاً أو أنشئ مشروعاً جديداً أولاً."),
    "steps": ("Steps", "الخطوات"),
    "stage": ("Stage", "المرحلة"),
    "you": ("You", "أنت"),
    "agent": ("Agent", "الوكيل"),
    "question": ("Question", "سؤال"),
    "attached": ("Attached", "مرفقات"),
    "open": ("Open", "فتح"),
    "refresh": ("Refresh", "تحديث"),
    "no_folder": ("Choose the project folder in the project settings.", "اختر مجلد المشروع من إعدادات المشروع."),
    # approval
    "perm_title": ("Permission request", "طلب إذن"),
    "stage_title": ("Move to the next stage?", "الانتقال إلى المرحلة التالية؟"),
    "allow": ("Allow", "اسمح"),
    "deny": ("Deny", "ارفض"),
    "approve": ("Approve", "موافق"),
    "reject": ("Reject", "رفض"),
    "reason": ("Reason", "السبب"),
    "answered_whatsapp": ("Answered from WhatsApp", "تمت الإجابة من واتساب"),
    "kind_open_app": ("Open an application", "فتح برنامج"),
    "kind_open_file_outside_project": ("Open a file outside the project folder", "فتح ملف خارج مجلد المشروع"),
    "kind_browser": ("Open a web browser", "فتح متصفح إنترنت"),
    "kind_email": ("Open email", "فتح البريد الإلكتروني"),
    "kind_whatsapp": ("Open WhatsApp", "فتح واتساب"),
    "kind_overwrite_file": ("Overwrite a file", "الكتابة فوق ملف"),
    "kind_delete_file": ("Delete a file", "حذف ملف"),
    "kind_stage_change": ("Change project stage", "تغيير مرحلة المشروع"),
    "kind_other": ("Sensitive action", "إجراء حساس"),
    "retry_q": ("The service is busy. Try again?", "الخدمة مشغولة. هل تريد المحاولة مرة أخرى؟"),
    # project dialog
    "project": ("Project", "المشروع"),
    "project_name": ("Project name", "اسم المشروع"),
    "project_folder": ("Project folder", "مجلد المشروع"),
    "browse": ("Browse…", "استعراض…"),
    "approved_apps": ("Apps the agent may control", "البرامج المسموح للوكيل بالتحكم فيها"),
    "add_running": ("+ Add an open app", "+ إضافة برنامج مفتوح"),
    "remove": ("Remove", "إزالة"),
    "save": ("Save", "حفظ"),
    "cancel": ("Cancel", "إلغاء"),
    # settings
    "language": ("Language", "اللغة"),
    "work_screen": ("Work screen (the agent sees only this screen)", "شاشة العمل (الوكيل يرى هذه الشاشة فقط)"),
    "screen_n": ("Screen {n} — {w}×{h}", "الشاشة {n} — {w}×{h}"),
    "voice_replies": ("Speak the agent's replies", "قراءة ردود الوكيل بصوت مسموع"),
    "voice_speed": ("Voice speed", "سرعة الصوت"),
    "restart_note": ("Language changes apply after sign-in again.", "تغيير اللغة يطبّق بعد تسجيل الدخول من جديد."),
    # whatsapp
    "wa_not_ready": ("WhatsApp is not set up yet by Cyber Xpert.", "لم يتم إعداد واتساب بعد من Cyber Xpert."),
    "wa_link_info": ("A WhatsApp chat will open with a link code. Send it as it is to link your number.",
                     "ستُفتح محادثة واتساب فيها رمز ربط. أرسله كما هو لربط رقمك."),
    # compact
    "expand": ("Expand", "توسيع"),
    # owner
    "workspace": ("Workspace", "مساحة العمل"),
    "monitoring": ("Monitoring", "المراقبة"),
    "live": ("Live", "مباشر"),
    "sessions": ("Sessions", "الجلسات"),
    "permissions_log": ("Permissions", "سجل الأذونات"),
    "accounts": ("Accounts", "الحسابات"),
    "model_limits": ("Model and limits", "النموذج والحدود"),
    "server_status": ("Server", "الخادم"),
    "spend_today": ("Spend today", "تكلفة اليوم"),
    "spend_month": ("This month", "هذا الشهر"),
    "running": ("Running now", "يعمل الآن"),
    "enable": ("Enable", "تفعيل"),
    "disable": ("Disable", "إيقاف الحساب"),
    "model": ("Model", "النموذج"),
    "effort": ("Effort", "مستوى التفكير"),
    "max_steps": ("Max steps per task", "أقصى عدد خطوات للمهمة"),
    "saved": ("Saved", "تم الحفظ"),
    "online": ("Online", "متصل"),
    "offline": ("Offline", "غير متصل"),
}

_lang = "ar"


def set_language(lang: str) -> None:
    global _lang
    _lang = "ar" if lang == "ar" else "en"


def language() -> str:
    return _lang


def is_rtl() -> bool:
    return _lang == "ar"


def tr(key: str, **kw: object) -> str:
    pair = _T.get(key)
    text = key if pair is None else pair[1 if _lang == "ar" else 0]
    return text.format(**kw) if kw else text
