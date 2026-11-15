# Empire Gym — Screen Inventory (screens.md)

Two Android apps from one codebase:
- **Member app** (`ae.duneai.empiregym.member`): for people inside the gym (members) and outside it (online clients, shoppers, guests).
- **Staff app** (`ae.duneai.empiregym.staff`): reception/front desk, used to sign up walk-in members, check people in, renew, freeze and sell products at the counter.

Request references (the request was given as a voice-style brief, see coverage.md):
R1 online subscriptions · R2 walk-in subscriptions at the gym · R3 show products · R4 show services · R5 show plans/subscriptions · R6 show offers · R7 membership/loyalty program · R8 tiers (Bronze→Platinum) with or without a subscription · R9 big member profile · R10 calorie tracking · R11 workouts the member is doing · R12 training plans · R13 subscription tracking · R14 machine sections, how to use each machine, machine video · R15 serves members inside the gym and people outside.

Legend: ✅ built in the app.

## Member app

| ID | Module | Screen (EN) | Screen (AR) | Purpose / main elements | Navigates to | Ref |
|---|---|---|---|---|---|---|
| A01 | Auth | Splash | شاشة البداية | Logo on black, gold ring | A02 (first launch) / A04 / H01 | — | ✅
| A02 | Auth | Language | اختيار اللغة | Arabic / English cards, continue | A03 | — | ✅
| A03 | Auth | Onboarding (3 slides) | التعريف بالتطبيق | Train smarter · Track calories · Earn rewards; skip/next | A04 | R15 | ✅
| A04 | Auth | Welcome | مرحباً | Hero, "I'm new", "Sign in", "Continue as guest", language switch | A06, A05, H01 | R15 | ✅
| A05 | Auth | Login | تسجيل الدخول | Phone (+971) or email, password, forgot, language switch | A07 → H01, A08, A06 | — | ✅
| A06 | Auth | Register | إنشاء حساب | Name, phone, email, gender, DOB, password, terms | A07 | — | ✅
| A07 | Auth | OTP verification | رمز التحقق | 4 boxes, hint 1234, resend timer | A12 (register) / H01 (login) / A10 (reset) | — | ✅
| A08 | Auth | Forgot password | نسيت كلمة المرور | Phone/email input | A07 (reset mode) | — | ✅
| A10 | Auth | New password | كلمة مرور جديدة | New + confirm, strength | A11 | — | ✅
| A11 | Auth | Password reset success | تم تغيير كلمة المرور | Animated check | A05 | — | ✅
| A12 | Setup | Fitness goal (step 1/3) | هدفك (١/٣) | Lose fat / Build muscle / Get fit / Strength | A13 | R9 R10 | ✅
| A13 | Setup | Body metrics (2/3) | قياسات الجسم (٢/٣) | Gender, age, height, weight, target weight | A14 | R9 R10 | ✅
| A14 | Setup | Activity level (3/3) | مستوى النشاط (٣/٣) | Sedentary → athlete, experience level | A15 | R10 | ✅
| A15 | Setup | Your plan is ready | خطتك جاهزة | Daily calories, macros, suggested program | H01 | R10 R12 | ✅
| H01 | Home | Home | الرئيسية | Greeting, membership card or Join CTA, check-in QR, today's calories ring, today's workout, offers carousel, quick actions, classes today, shop picks | Everywhere | R1–R15 | ✅
| H02 | Home | Search | البحث | Search plans, products, services, machines, exercises; recent searches; empty state | Detail screens | R3 R4 R14 | ✅
| H03 | Home | Notifications | الإشعارات | Tabs All/Offers/Bookings/Membership, unread dots, mark all read, empty | Related screens | — | ✅
| H04 | Home | Digital member card / Check-in QR | بطاقة العضوية | QR, member ID, tier, valid until, brightness note | — | R2 R13 | ✅
| M01 | Memberships | Plans | الاشتراكات | Tabs Gym / Online coaching / Day passes, plan cards w/ price AED, popular badge, tier included | M02 | R1 R5 | ✅
| M02 | Memberships | Plan details | تفاصيل الاشتراك | Price, duration, features, tier benefits, terms, Subscribe | M03 | R1 R5 R8 | ✅
| M03 | Checkout | Start date & add-ons (1/3) | البداية والإضافات (١/٣) | Start date picker, add-ons (PT pack, locker, towel, InBody) | M04 | R1 | ✅
| M04 | Checkout | Review & promo (2/3) | المراجعة والخصم (٢/٣) | Summary, promo code, points discount, tier discount, totals + VAT 5% | M05 | R1 R6 R7 | ✅
| M05 | Checkout | Payment (3/3) | الدفع (٣/٣) | Saved cards, add card, Apple/Google Pay, **Pay at the gym (walk-in)** | M06 / M07 | R1 R2 | ✅
| M06 | Payments | Add card | إضافة بطاقة | Card number, name, expiry, CVV, save toggle, validation | M05 / P05 | — | ✅
| M07 | Checkout | Subscription success | تم الاشتراك | Animation, membership number, QR, "Pay at gym" pending note | M08 / H04 | R1 R2 | ✅
| M08 | Memberships | My membership | اشتراكي | Status (active/frozen/expired/pending), days left ring, plan, tier, renew, upgrade, freeze, invoices | M09 M10 M01 | R13 | ✅
| M09 | Memberships | Freeze membership | تجميد الاشتراك | Freeze length (7/14/30 days), start date, reason, confirm sheet | M08 | R13 | ✅
| M10 | Memberships | Invoices / history | الفواتير والسجل | List of payments with status | M11 | R13 | ✅
| M11 | Memberships | Invoice detail | تفاصيل الفاتورة | Items, VAT, totals, method, share | — | R13 | ✅
| L01 | Loyalty | Empire Rewards | مكافآت إمباير | Tier card (Bronze/Silver/Gold/Platinum), points, progress to next tier, ways to earn, benefits | L02 L03 L05 L06 L07 | R7 R8 | ✅
| L02 | Loyalty | Tiers compared | مقارنة المستويات | 4 tiers: with or without subscription, how to reach, perks table | M01 | R8 | ✅
| L03 | Loyalty | Rewards catalog | كتالوج المكافآت | Category chips, rewards with points cost, locked by tier | L04 | R7 | ✅
| L04 | Loyalty | Reward detail | تفاصيل المكافأة | Image, cost, terms, Redeem → confirm sheet → voucher code | L07 | R7 | ✅
| L05 | Loyalty | Points history | سجل النقاط | Earned/spent tabs | — | R7 | ✅
| L06 | Loyalty | Refer a friend | ادعُ صديقاً | Code, share, how it works, referrals list | — | R7 | ✅
| L07 | Loyalty | My vouchers | قسائمي | Active/used/expired tabs, copy code | — | R6 R7 | ✅
| O01 | Offers | Offers | العروض | Filter chips (All, Memberships, Shop, Services, Members only), banners, expiry | O02 | R6 | ✅
| O02 | Offers | Offer detail | تفاصيل العرض | Hero, discount, code copy, eligibility (tier), CTA to plan/product | M02 / S03 / C02 | R6 R8 | ✅
| S01 | Shop | Shop | المتجر | Categories (Supplements, Energy drinks, Apparel, Accessories), product grid, member price, cart badge | S02 S03 S04 | R3 | ✅
| S02 | Shop | Filter & sort (sheet) | التصفية والترتيب | Category, price range, in stock, sort | S01 | R3 | ✅
| S03 | Shop | Product detail | تفاصيل المنتج | Gallery, flavour/size, qty, member price, description, nutrition, add to cart, favorite | S04 | R3 | ✅
| S04 | Shop | Cart | السلة | Items, qty stepper, remove, tier discount, totals, empty state | S05 | R3 | ✅
| S05 | Shop | Checkout | إتمام الطلب | Pickup at gym / Delivery, address, payment, notes | S06 S08 | R3 | ✅
| S06 | Shop | Addresses | العناوين | Saved addresses, default, add | S07 | — | ✅
| S07 | Shop | Add / edit address | إضافة عنوان | Emirate, area, building, flat, label, validation | S06 | — | ✅
| S08 | Shop | Order placed | تم الطلب | Animation, order no., track | S10 | R3 | ✅
| S09 | Shop | My orders | طلباتي | Tabs Active/Completed/Cancelled | S10 | R3 | ✅
| S10 | Shop | Order tracking | تتبع الطلب | Status timeline, items, cancel order dialog | — | R3 | ✅
| S11 | Shop | Favorites | المفضلة | Saved products, empty state | S03 | R3 | ✅
| C01 | Services | Services | الخدمات | Personal training, Nutrition consult, InBody scan, Recovery & massage, Group classes, Online coaching | C02 C08 | R4 | ✅
| C02 | Services | Service detail | تفاصيل الخدمة | Description, packages (1/5/10 sessions), price, member discount, Book | C03 | R4 | ✅
| C03 | Booking | Choose coach (1/3) | اختر المدرب (١/٣) | Coach cards, rating, specialties | C04 / C05 | R4 | ✅
| C04 | Booking | Coach profile | ملف المدرب | Bio, certifications, specialties, reviews, Book | C05 | R4 | ✅
| C05 | Booking | Date & time (2/3) | التاريخ والوقت (٢/٣) | Week day strip, time slots (available/taken) | C06 | R4 | ✅
| C06 | Booking | Review & confirm (3/3) | المراجعة والتأكيد (٣/٣) | Summary, use session credits or pay | C07 | R4 | ✅
| C07 | Booking | Booking confirmed | تم الحجز | Animation, add-to-calendar note | C10 | R4 | ✅
| C08 | Classes | Class schedule | جدول الحصص | Day strip, class list w/ spots left, category filter | C09 | R4 | ✅
| C09 | Classes | Class detail | تفاصيل الحصة | Coach, time, intensity, spots, Book spot / Join waitlist | C07 | R4 | ✅
| C10 | Booking | My bookings | حجوزاتي | Tabs Upcoming/Completed/Cancelled | C11 | R4 | ✅
| C11 | Booking | Booking detail | تفاصيل الحجز | Info, reschedule, cancel (confirm dialog) | C05 | R4 | ✅
| T01 | Training | Training hub | التمارين | Active plan progress, today's workout, quick links (plans, my workouts, history, progress, machines) | T02… | R11 R12 | ✅
| T02 | Training | Training plans | خطط التدريب | Filter by goal/level, plans incl. coach-assigned online plan | T03 | R12 | ✅
| T03 | Training | Plan detail | تفاصيل الخطة | Weeks, days, equipment, Start plan | T04 | R12 | ✅
| T04 | Training | Workout detail | تفاصيل التمرين اليومي | Exercise list (sets×reps), duration, kcal, Start | T06 T05 | R11 R12 | ✅
| T05 | Training | Exercise detail | تفاصيل التمرين | Video, steps, muscles, machine link, tips | E03 E04 | R11 R14 | ✅
| T06 | Training | Active workout | تمرين جارٍ | Timer, current exercise, log sets (kg × reps), rest timer, next | T07 | R11 | ✅
| T07 | Training | Workout complete | انتهى التمرين | Duration, volume, kcal, PRs, points earned | T08 | R7 R11 | ✅
| T08 | Training | Workout history | سجل التمارين | Calendar strip/list of logged workouts | T04 | R11 | ✅
| T09 | Training | My workouts (custom) | تماريني | Created workouts list, create | T10 | R11 | ✅
| T10 | Training | Create workout | إنشاء تمرين | Name, day, add exercises (picker sheet), sets/reps | T09 | R11 | ✅
| T11 | Progress | Progress & PRs | التقدم والأرقام القياسية | Weight chart, PR list w/ chart (Goblet squat style) | T12 T13 | R9 R11 | ✅
| T12 | Progress | Add record | إضافة رقم قياسي | Exercise, reps/weight, date | T11 | R11 | ✅
| T13 | Progress | Body measurements | قياسات الجسم | Weight, body fat, muscle, InBody history, add | T14 | R9 | ✅
| T14 | Progress | Add measurement | إضافة قياس | Weight, body fat %, waist, date | T13 | R9 | ✅
| N01 | Nutrition | Calories today | السعرات اليوم | Calorie ring (goal/eaten/burned), macros, meals (breakfast/lunch/dinner/snacks), water tracker | N02 N04 N05 | R10 | ✅
| N02 | Nutrition | Add food | إضافة طعام | Search, recent, UAE foods db, meal selector | N03 | R10 | ✅
| N03 | Nutrition | Food detail | تفاصيل الطعام | Portion stepper, macros, add to meal | N01 | R10 | ✅
| N04 | Nutrition | Calorie calculator | حاسبة السعرات | BMR/TDEE (Mifflin-St Jeor), goal → target; save as goal | N01 | R10 | ✅
| N05 | Nutrition | Meal plan | خطة الوجبات | Day plan from nutritionist, book consult CTA | C02 | R10 R4 | ✅
| E01 | Machines | Gym zones | أقسام الجيم | Zones: Cardio, Chest & shoulders, Back, Legs, Arms, Free weights, Functional | E02 E05 | R14 | ✅
| E02 | Machines | Machines in zone | أجهزة القسم | Machine cards with muscles, difficulty | E03 | R14 | ✅
| E03 | Machines | Machine detail | تفاصيل الجهاز | Photo, video, how-to steps, muscles, settings, mistakes, safety, related exercises | E04 T05 | R14 | ✅
| E04 | Machines | Video player | الفيديو | Full-width YouTube player | — | R14 | ✅
| E05 | Machines | Scan machine QR | مسح رمز الجهاز | Camera scanner + manual code entry (code is printed on each machine) | E03 | R14 | ✅
| P01 | Profile | Profile | الملف الشخصي | Avatar, tier badge, stats (workouts, streak, kcal, points), body summary, sections: membership, rewards, orders, bookings, progress, nutrition, settings | All | R9 | ✅
| P02 | Profile | Edit profile | تعديل الملف | Photo, name, email, phone, gender, DOB, emergency contact | P01 | R9 | ✅
| P03 | Profile | Fitness profile & goals | الأهداف واللياقة | Goal, height, weight, target, activity → recalculates calories | P01 | R9 R10 | ✅
| P04 | Profile | Payment methods | طرق الدفع | Saved cards, default, delete, add | M06 | — | ✅
| P05 | Profile | Settings | الإعدادات | Language, notification toggles, units (kg/lb), change password, delete account | P06 P12 | — | ✅
| P06 | Profile | Change password | تغيير كلمة المرور | Current, new, confirm | P05 | — | ✅
| P07 | Info | About Empire Gym | عن إمباير جيم | Story, address (Mussafah Shabiya 11, Bldg C201), hours, phone, map | P08 | — | ✅
| P08 | Info | Contact us | تواصل معنا | Call, WhatsApp, email, message form | — | — | ✅
| P09 | Info | Help & FAQ | المساعدة والأسئلة | Search, expandable FAQs | P08 | — | ✅
| P10 | Info | Terms & conditions | الشروط والأحكام | Text | — | — | ✅
| P11 | Info | Privacy policy | سياسة الخصوصية | Text | — | — | ✅
| P12 | Profile | Delete account | حذف الحساب | Reason, warning, confirm dialog | A04 | — | ✅
| P13 | Profile | Logout (dialog) | تسجيل الخروج | Confirm dialog | A04 | — | ✅
| P14 | Coaching | Coach chat | محادثة المدرب | Chat with assigned coach (online & in-gym) | — | R12 R15 | ✅
| G01 | Guest | Guest gate (sheet) | تسجيل مطلوب | Shown when guests try member-only actions | A05 A06 | R15 | ✅

Shared states used across lists and flows: skeleton loading, empty state, error / no internet with retry, confirmation dialogs, bottom sheets, toasts.

## Staff app

| ID | Module | Screen (EN) | Screen (AR) | Purpose / main elements | Navigates to | Ref |
|---|---|---|---|---|---|---|
| R01 | Auth | Staff login | دخول الموظفين | Staff ID + PIN, language switch | R02 | R2 | ✅
| R02 | Desk | Dashboard | لوحة التحكم | Today: check-ins, new members, sales AED, expiring soon; quick actions | R03 R07 R09 R11 | R2 | ✅
| R03 | Walk-in | New member: details (1/3) | عضو جديد: البيانات (١/٣) | Name, phone, Emirates ID, gender, DOB, emergency contact | R04 | R2 | ✅
| R04 | Walk-in | Choose plan (2/3) | اختيار الباقة (٢/٣) | Plans, start date, add-ons, tier | R05 | R2 R5 R8 | ✅
| R05 | Walk-in | Payment (3/3) | الدفع (٣/٣) | Cash / Card terminal / Payment link, discount, totals | R06 | R2 | ✅
| R06 | Walk-in | Member registered | تم تسجيل العضو | Member ID, QR card, send app invite via SMS/WhatsApp | R08 R02 | R2 | ✅
| R07 | Members | Members | الأعضاء | Search, tabs Active/Expiring/Expired/Frozen/Pending | R08 | R2 R13 | ✅
| R08 | Members | Member detail | تفاصيل العضو | Status, plan, tier, visits, Check in, Renew, Freeze/Unfreeze, Activate (pay-at-gym) | R04 R09 | R2 R13 | ✅
| R09 | Check-in | Check-in | تسجيل الدخول للنادي | Scan member QR (camera) or enter ID, result card (allowed / expired) | R08 | R2 | ✅
| R10 | Check-in | Today's visits | زيارات اليوم | Log list with time | R08 | R2 | ✅
| R11 | POS | Counter sale | البيع في الكاونتر | Product grid, cart, member lookup for tier price | R12 | R3 | ✅
| R12 | POS | Sale complete | تمت عملية البيع | Receipt summary | R02 | R3 | ✅
| R13 | Account | Staff profile & settings | حساب الموظف | Shift, language, logout | R01 | — | ✅
