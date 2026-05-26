// servenow-backend/seed.js
// ── Run this once to fill your database with sample data ─────────────────────
// Command: node seed.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ── Import all models ─────────────────────────────────────────────────────────
const User = require("./models/User");
const Provider = require("./models/Provider");
const Service = require("./models/Service");
const Booking = require("./models/Booking");
const Review = require("./models/Review");

// ── Connect DB ────────────────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/servenow");
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
        process.exit(1);
    }
};

// ── Clear all collections ─────────────────────────────────────────────────────
const clearAll = async () => {
    await Promise.all([
        User.deleteMany({}),
        Provider.deleteMany({}),
        Service.deleteMany({}),
        Booking.deleteMany({}),
        Review.deleteMany({}),
    ]);
    console.log("🗑️  All collections cleared");
};

// ── Seed Users ────────────────────────────────────────────────────────────────
const seedUsers = async () => {
    const salt = await bcrypt.genSalt(10);

    const users = await User.insertMany([
        // ── Admin ──
        {
            name: "Admin ServeNow",
            email: "admin@servenow.in",
            password: await bcrypt.hash("admin123", salt),
            phone: "9000000001",
            role: "admin",
            isActive: true,
            isEmailVerified: true,
            address: { street: "HQ", city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
        },

        // ── Regular Users ──
        {
            name: "Arun Kumar",
            email: "arun@test.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9876543210",
            role: "user",
            isActive: true,
            isEmailVerified: true,
            address: { street: "12 Anna Nagar", city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
        },
        {
            name: "Priya Ramesh",
            email: "priya@test.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9876543211",
            role: "user",
            isActive: true,
            isEmailVerified: true,
            address: { street: "45 Gandhipuram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641012" },
        },
        {
            name: "Divya Suresh",
            email: "divya@test.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9876543212",
            role: "user",
            isActive: true,
            isEmailVerified: true,
            address: { street: "7 RS Puram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641002" },
        },

        // ── Provider Users ──
        {
            name: "Ravi Kumar",
            email: "ravi@provider.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9800000001",
            role: "provider",
            isActive: true,
            isEmailVerified: true,
            address: { street: "23 Gandhipuram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641012" },
        },
        {
            name: "Suresh M",
            email: "suresh@provider.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9800000002",
            role: "provider",
            isActive: true,
            isEmailVerified: true,
            address: { street: "56 RS Puram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641002" },
        },
        {
            name: "Meena S",
            email: "meena@provider.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9800000003",
            role: "provider",
            isActive: true,
            isEmailVerified: true,
            address: { street: "11 Saibaba Colony", city: "Coimbatore", state: "Tamil Nadu", pincode: "641011" },
        },
        {
            name: "Arjun D",
            email: "arjun@provider.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9800000004",
            role: "provider",
            isActive: true,
            isEmailVerified: true,
            address: { street: "88 Peelamedu", city: "Coimbatore", state: "Tamil Nadu", pincode: "641004" },
        },
        {
            name: "Priya R",
            email: "priyar@provider.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9800000005",
            role: "provider",
            isActive: true,
            isEmailVerified: true,
            address: { street: "34 Peelamedu", city: "Coimbatore", state: "Tamil Nadu", pincode: "641004" },
        },
        {
            name: "Karthik V",
            email: "karthik@provider.com",
            password: await bcrypt.hash("test123", salt),
            phone: "9800000006",
            role: "provider",
            isActive: true,
            isEmailVerified: true,
            address: { street: "99 Saravanampatti", city: "Coimbatore", state: "Tamil Nadu", pincode: "641035" },
        },
    ]);

    console.log(`✅ Users seeded: ${users.length}`);
    return users;
};

// ── Seed Providers ────────────────────────────────────────────────────────────
const seedProviders = async (users) => {
    const providerUsers = users.filter(u => u.role === "provider");

    const providers = await Provider.insertMany([
        {
            user: providerUsers[0]._id,   // Ravi Kumar
            bio: "Master plumber with 10+ years of experience in residential and commercial plumbing. Available for emergency repairs.",
            category: "Plumbing",
            skills: ["Pipe Repair", "Leak Fix", "Tap Installation", "Drainage", "Waterproofing"],
            experience: 10,
            hourlyRate: 299,
            isAvailable: true,
            isVerified: true,
            badge: "Top Rated",
            averageRating: 4.9,
            totalReviews: 312,
            totalJobsDone: 800,
            responseTime: "~10 mins",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "08:00", end: "20:00" },
            location: {
                address: "23 Gandhipuram",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641012",
                coordinates: { type: "Point", coordinates: [76.9558, 11.0168] },
            },
        },
        {
            user: providerUsers[1]._id,   // Suresh M
            bio: "Senior electrician specializing in home wiring, fan fitting, and inverter installation. Safety-first approach.",
            category: "Electrician",
            skills: ["Wiring", "Fan Fitting", "Switchboard", "Inverter", "MCB Repair"],
            experience: 8,
            hourlyRate: 350,
            isAvailable: true,
            isVerified: true,
            badge: "Pro Verified",
            averageRating: 4.8,
            totalReviews: 245,
            totalJobsDone: 600,
            responseTime: "~15 mins",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "07:00", end: "21:00" },
            location: {
                address: "56 RS Puram",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641002",
                coordinates: { type: "Point", coordinates: [76.9421, 11.0054] },
            },
        },
        {
            user: providerUsers[2]._id,   // Meena S
            bio: "Deep cleaning specialist. Expert in kitchen, bathroom, and full-home cleaning. Eco-friendly products used.",
            category: "Home Cleaning",
            skills: ["Deep Clean", "Kitchen Cleaning", "Bathroom Cleaning", "Move-in Clean", "Sofa Cleaning"],
            experience: 5,
            hourlyRate: 199,
            isAvailable: true,
            isVerified: true,
            badge: "Pro Verified",
            averageRating: 5.0,
            totalReviews: 189,
            totalJobsDone: 420,
            responseTime: "~5 mins",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "08:00", end: "18:00" },
            location: {
                address: "11 Saibaba Colony",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641011",
                coordinates: { type: "Point", coordinates: [76.9558, 11.0200] },
            },
        },
        {
            user: providerUsers[3]._id,   // Arjun D
            bio: "AC and appliance technician. Certified for all brands. Gas refill, deep service, and installation.",
            category: "AC Repair",
            skills: ["AC Service", "Gas Refill", "AC Installation", "Deep Cleaning", "Inverter AC"],
            experience: 7,
            hourlyRate: 450,
            isAvailable: false,
            isVerified: true,
            badge: "Fast Response",
            averageRating: 4.7,
            totalReviews: 178,
            totalJobsDone: 390,
            responseTime: "~20 mins",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "09:00", end: "19:00" },
            location: {
                address: "88 Peelamedu",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641004",
                coordinates: { type: "Point", coordinates: [77.0100, 11.0300] },
            },
        },
        {
            user: providerUsers[4]._id,   // Priya R
            bio: "Home tutor for all subjects. Specializes in Maths and Science for grades 6-12. CBSE and State board.",
            category: "Tutoring",
            skills: ["Maths", "Science", "English", "CBSE", "State Board", "Competitive Exams"],
            experience: 6,
            hourlyRate: 250,
            isAvailable: true,
            isVerified: true,
            badge: "Most Booked",
            averageRating: 4.9,
            totalReviews: 401,
            totalJobsDone: 1200,
            responseTime: "~8 mins",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "06:00", end: "21:00" },
            location: {
                address: "34 Peelamedu",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641004",
                coordinates: { type: "Point", coordinates: [77.0050, 11.0280] },
            },
        },
        {
            user: providerUsers[5]._id,   // Karthik V
            bio: "Skilled carpenter specializing in custom furniture, modular interiors, and furniture repair.",
            category: "Carpentry",
            skills: ["Furniture Repair", "Custom Shelf", "Modular Kitchen", "Door Repair", "Bed Frame"],
            experience: 9,
            hourlyRate: 380,
            isAvailable: true,
            isVerified: true,
            badge: "New & Rising",
            averageRating: 4.6,
            totalReviews: 134,
            totalJobsDone: 280,
            responseTime: "~25 mins",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "08:00", end: "20:00" },
            location: {
                address: "99 Saravanampatti",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641035",
                coordinates: { type: "Point", coordinates: [77.0400, 11.0600] },
            },
        },
    ]);

    console.log(`✅ Providers seeded: ${providers.length}`);
    return providers;
};

// ── Seed Services ─────────────────────────────────────────────────────────────
const seedServices = async (providers) => {
    const services = await Service.insertMany([
        // Ravi Kumar — Plumbing
        { provider: providers[0]._id, title: "Pipe Repair", category: "Plumbing", subCategory: "Pipe Repair", pricingType: "hourly", price: 299, estimatedDuration: 90, tags: ["pipe", "leak", "repair"], bookingCount: 45, isActive: true, description: "Expert pipe repair for all types of leaks, cracks, and burst pipes. Same-day service available." },
        { provider: providers[0]._id, title: "Tap Installation", category: "Plumbing", subCategory: "Tap Install", pricingType: "fixed", price: 199, estimatedDuration: 45, tags: ["tap", "faucet", "install"], bookingCount: 38, isActive: true, description: "Install any type of tap or faucet. Kitchen, bathroom, and outdoor taps covered." },
        { provider: providers[0]._id, title: "Drain Cleaning", category: "Plumbing", subCategory: "Drainage", pricingType: "fixed", price: 249, estimatedDuration: 60, tags: ["drain", "clog", "cleaning"], bookingCount: 29, isActive: true, description: "Unclog and clean blocked drains. Kitchen sink, bathroom drain, and floor traps." },
        { provider: providers[0]._id, title: "Full Inspection", category: "Plumbing", subCategory: "Inspection", pricingType: "fixed", price: 499, estimatedDuration: 150, tags: ["inspection", "plumbing", "check"], bookingCount: 12, isActive: true, description: "Complete plumbing inspection of your home. Get a detailed report with recommendations." },

        // Suresh M — Electrician
        { provider: providers[1]._id, title: "Wiring & Rewiring", category: "Electrician", subCategory: "Wiring", pricingType: "hourly", price: 350, estimatedDuration: 120, tags: ["wiring", "electrical", "home"], bookingCount: 52, isActive: true, description: "Complete home wiring, rewiring, and cable management. Certified electrician." },
        { provider: providers[1]._id, title: "Fan Fitting", category: "Electrician", subCategory: "Fan Fitting", pricingType: "fixed", price: 150, estimatedDuration: 30, tags: ["fan", "ceiling fan", "install"], bookingCount: 88, isActive: true, description: "Install ceiling fans, wall fans, and exhaust fans. All brands supported." },
        { provider: providers[1]._id, title: "Switchboard Repair", category: "Electrician", subCategory: "Switchboard", pricingType: "fixed", price: 200, estimatedDuration: 60, tags: ["switch", "board", "socket"], bookingCount: 41, isActive: true, description: "Repair or replace faulty switchboards, sockets, and circuit breakers." },
        { provider: providers[1]._id, title: "Inverter Setup", category: "Electrician", subCategory: "Inverter", pricingType: "fixed", price: 599, estimatedDuration: 120, tags: ["inverter", "UPS", "battery"], bookingCount: 19, isActive: true, description: "Install and configure home inverter and battery backup systems." },

        // Meena S — Cleaning
        { provider: providers[2]._id, title: "Full Home Deep Clean", category: "Home Cleaning", subCategory: "Deep Clean", pricingType: "fixed", price: 999, estimatedDuration: 240, tags: ["deep clean", "home", "full"], bookingCount: 67, isActive: true, description: "Complete deep cleaning of your home. All rooms, kitchen, bathrooms included." },
        { provider: providers[2]._id, title: "Kitchen Cleaning", category: "Home Cleaning", subCategory: "Kitchen", pricingType: "fixed", price: 399, estimatedDuration: 90, tags: ["kitchen", "cleaning", "grease"], bookingCount: 55, isActive: true, description: "Deep kitchen cleaning including chimney, stove, sink, and cabinets." },
        { provider: providers[2]._id, title: "Bathroom Cleaning", category: "Home Cleaning", subCategory: "Bathroom", pricingType: "fixed", price: 299, estimatedDuration: 60, tags: ["bathroom", "toilet", "tiles"], bookingCount: 72, isActive: true, description: "Professional bathroom cleaning with disinfection. Tiles, commode, shower area." },
        { provider: providers[2]._id, title: "Move-in Cleaning", category: "Home Cleaning", subCategory: "Move-in Clean", pricingType: "fixed", price: 1499, estimatedDuration: 360, tags: ["move-in", "new home", "clean"], bookingCount: 23, isActive: true, description: "Complete cleaning for a new home before moving in. Top to bottom." },

        // Arjun D — AC Repair
        { provider: providers[3]._id, title: "AC Service", category: "AC Repair", subCategory: "AC Service", pricingType: "fixed", price: 499, estimatedDuration: 60, tags: ["AC", "service", "cleaning"], bookingCount: 61, isActive: true, description: "Complete AC service and cleaning. Improves cooling efficiency and air quality." },
        { provider: providers[3]._id, title: "Gas Refill", category: "AC Repair", subCategory: "Gas Refill", pricingType: "fixed", price: 799, estimatedDuration: 60, tags: ["gas", "refrigerant", "AC"], bookingCount: 38, isActive: true, description: "AC gas refilling service. All refrigerant types (R22, R32, R410A) available." },
        { provider: providers[3]._id, title: "AC Installation", category: "AC Repair", subCategory: "Installation", pricingType: "fixed", price: 999, estimatedDuration: 120, tags: ["install", "AC", "split", "window"], bookingCount: 25, isActive: true, description: "Install split AC, window AC, or cassette AC. All brands and tonnage." },

        // Priya R — Tutoring
        { provider: providers[4]._id, title: "Maths Tutoring", category: "Tutoring", subCategory: "Maths", pricingType: "hourly", price: 250, estimatedDuration: 60, tags: ["maths", "tutor", "CBSE"], bookingCount: 120, isActive: true, description: "Personalized maths tutoring for grades 6-12. CBSE, State board, and competitive exams." },
        { provider: providers[4]._id, title: "Science Tutoring", category: "Tutoring", subCategory: "Science", pricingType: "hourly", price: 250, estimatedDuration: 60, tags: ["science", "physics", "chemistry"], bookingCount: 95, isActive: true, description: "Physics, Chemistry, and Biology tutoring. Practical-focused approach." },
        { provider: providers[4]._id, title: "English Coaching", category: "Tutoring", subCategory: "English", pricingType: "hourly", price: 200, estimatedDuration: 60, tags: ["english", "grammar", "speaking"], bookingCount: 78, isActive: true, description: "Spoken English, grammar, and writing skills. All age groups." },

        // Karthik V — Carpentry
        { provider: providers[5]._id, title: "Furniture Repair", category: "Carpentry", subCategory: "Furniture Repair", pricingType: "hourly", price: 380, estimatedDuration: 120, tags: ["furniture", "repair", "wood"], bookingCount: 42, isActive: true, description: "Repair broken furniture, chairs, tables, beds, and wardrobes." },
        { provider: providers[5]._id, title: "Custom Shelf", category: "Carpentry", subCategory: "Custom Shelf", pricingType: "fixed", price: 1200, estimatedDuration: 240, tags: ["shelf", "custom", "wall"], bookingCount: 28, isActive: true, description: "Design and install custom wall shelves, book shelves, and display units." },
        { provider: providers[5]._id, title: "Modular Kitchen", category: "Carpentry", subCategory: "Modular", pricingType: "negotiable", price: 5000, estimatedDuration: 480, tags: ["modular", "kitchen", "cabinet"], bookingCount: 8, isActive: true, description: "Design and build modular kitchen cabinets and drawers. Custom measurements." },
    ]);

    console.log(`✅ Services seeded: ${services.length}`);
    return services;
};

// ── Seed Bookings ─────────────────────────────────────────────────────────────
const seedBookings = async (users, providers, services) => {
    const regularUsers = users.filter(u => u.role === "user");
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);

    const bookings = await Booking.insertMany([
        // Completed bookings (for reviews)
        {
            user: regularUsers[0]._id,
            provider: providers[0]._id,
            service: services[0]._id,
            bookingDate: lastWeek,
            timeSlot: { start: "10:00 AM", end: "12:00 PM" },
            jobAddress: { street: "12 Anna Nagar", city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
            totalAmount: 299,
            paymentMethod: "cash",
            paymentStatus: "paid",
            status: "completed",
            isReviewed: true,
            confirmedAt: lastWeek,
            completedAt: lastWeek,
        },
        {
            user: regularUsers[1]._id,
            provider: providers[1]._id,
            service: services[4]._id,
            bookingDate: lastWeek,
            timeSlot: { start: "02:00 PM", end: "04:00 PM" },
            jobAddress: { street: "45 Gandhipuram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641012" },
            totalAmount: 350,
            paymentMethod: "online",
            paymentStatus: "paid",
            status: "completed",
            isReviewed: true,
            confirmedAt: lastWeek,
            completedAt: lastWeek,
        },
        {
            user: regularUsers[2]._id,
            provider: providers[2]._id,
            service: services[8]._id,
            bookingDate: lastWeek,
            timeSlot: { start: "09:00 AM", end: "01:00 PM" },
            jobAddress: { street: "7 RS Puram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641002" },
            totalAmount: 999,
            paymentMethod: "cash",
            paymentStatus: "paid",
            status: "completed",
            isReviewed: false,
            confirmedAt: lastWeek,
            completedAt: lastWeek,
        },

        // Confirmed booking (upcoming)
        {
            user: regularUsers[0]._id,
            provider: providers[1]._id,
            service: services[5]._id,
            bookingDate: tomorrow,
            timeSlot: { start: "11:00 AM", end: "12:00 PM" },
            jobAddress: { street: "12 Anna Nagar", city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
            totalAmount: 150,
            paymentMethod: "cash",
            paymentStatus: "pending",
            status: "confirmed",
            confirmedAt: today,
        },

        // Pending bookings
        {
            user: regularUsers[1]._id,
            provider: providers[3]._id,
            service: services[12]._id,
            bookingDate: tomorrow,
            timeSlot: { start: "03:00 PM", end: "04:00 PM" },
            jobAddress: { street: "45 Gandhipuram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641012" },
            totalAmount: 499,
            paymentMethod: "cash",
            paymentStatus: "pending",
            status: "pending",
        },
        {
            user: regularUsers[0]._id,
            provider: providers[4]._id,
            service: services[15]._id,
            bookingDate: tomorrow,
            timeSlot: { start: "05:00 PM", end: "06:00 PM" },
            jobAddress: { street: "12 Anna Nagar", city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
            totalAmount: 250,
            paymentMethod: "online",
            paymentStatus: "pending",
            status: "pending",
        },

        // Cancelled booking
        {
            user: regularUsers[2]._id,
            provider: providers[0]._id,
            service: services[1]._id,
            bookingDate: yesterday,
            timeSlot: { start: "10:00 AM", end: "11:00 AM" },
            jobAddress: { street: "7 RS Puram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641002" },
            totalAmount: 199,
            paymentMethod: "cash",
            paymentStatus: "pending",
            status: "cancelled",
            cancelledBy: "user",
            cancellationReason: "Change of plans",
            cancelledAt: yesterday,
        },
    ]);

    console.log(`✅ Bookings seeded: ${bookings.length}`);
    return bookings;
};

// ── Seed Reviews ──────────────────────────────────────────────────────────────
const seedReviews = async (users, providers, bookings) => {
    const regularUsers = users.filter(u => u.role === "user");
    const completedBookings = bookings.filter(b => b.status === "completed");

    const reviews = await Review.insertMany([
        {
            user: regularUsers[0]._id,
            provider: providers[0]._id,
            booking: completedBookings[0]._id,
            rating: 5,
            comment: "Ravi was absolutely professional! Fixed our pipe leak in under an hour. Very clean work, no mess left behind. Will definitely book again. Transparent pricing too — exactly what was quoted.",
            subRatings: { punctuality: 5, quality: 5, communication: 5, value: 5 },
            helpfulVotes: 24,
            isVisible: true,
        },
        {
            user: regularUsers[1]._id,
            provider: providers[1]._id,
            booking: completedBookings[1]._id,
            rating: 5,
            comment: "Suresh did an excellent job with the wiring. He explained everything clearly and finished ahead of schedule. Very knowledgeable and safety-conscious. Highly recommended!",
            subRatings: { punctuality: 5, quality: 5, communication: 4, value: 5 },
            helpfulVotes: 18,
            isVisible: true,
        },
    ]);

    console.log(`✅ Reviews seeded: ${reviews.length}`);
    return reviews;
};

// ── Main seed function ────────────────────────────────────────────────────────
const seed = async () => {
    try {
        await connectDB();
        await clearAll();

        const users = await seedUsers();
        const providers = await seedProviders(users);
        const services = await seedServices(providers);
        const bookings = await seedBookings(users, providers, services);
        const reviews = await seedReviews(users, providers, bookings);

        console.log("\n🎉 DATABASE SEEDED SUCCESSFULLY!\n");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📊 Summary:");
        console.log(`   Users:     ${users.length}`);
        console.log(`   Providers: ${providers.length}`);
        console.log(`   Services:  ${services.length}`);
        console.log(`   Bookings:  ${bookings.length}`);
        console.log(`   Reviews:   ${reviews.length}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n🔑 Test Login Credentials:");
        console.log("   Admin:    admin@servenow.in    / admin123");
        console.log("   User:     arun@test.com        / test123");
        console.log("   User:     priya@test.com       / test123");
        console.log("   Provider: ravi@provider.com    / test123");
        console.log("   Provider: suresh@provider.com  / test123");
        console.log("   Provider: meena@provider.com   / test123");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seed();