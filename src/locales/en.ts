export const en = {
    nav: {
        home: "Home",
        features: "Features",
        howItWorks: "How It Works",
        reviews: "Reviews",
        contact: "Contact",
        login: "Log in",
        signup: "Sign Up",
        dashboard: "Dashboard",
        logout: "Sign Out",
        profile: "My Profile"
    },
    hero: {
        trusted: "Trusted by 10,000+ Landlords",
        titlePrefix: "Prop",
        titleSuffix: "Accura",
        welcome: "Welcome to PropAccura",
        subtitle: "Your complete solution for rental management and verification",
        description: "Manage properties, verify tenants, track rent & bills, and stay organized — all in one secure platform.",
        getStarted: "Get Started",
        learnMore: "Learn How It Works"
    },
    about: {
        problemTag: "The Problem",
        problemTitle: "Property management is chaotic.",
        problem1: "Landlords lose track of rent payments",
        problem2: "Tenants confused about bills & due dates",
        problem3: "Messy paperwork and identity verification",
        solutionTag: "The PropAccura Solution",
        solutionTitle: "We make it simple.",
        solution1: "We track every payment automatically",
        solution2: "Clear dashboards for bills & history",
        solution3: "Digital Application & ID Verification"
    },
    features: {
        title: "What PropAccura Does",
        subtitle: "Powerful tools designed to streamline your workflow and boost efficiency.",
        landlords: {
            title: "For Landlords",
            items: [
                "Manage all your property information in one place",
                "See occupied & vacant status",
                "Track rent, pending bills, and financial summaries",
                "Approve or reject tenant applications",
                "See tenant history & digital verification reports"
            ]
        },
        tenants: {
            title: "For Tenants",
            items: [
                "Securely register with basic details",
                "Choose your landlord from the list",
                "Submit ID details & payment history",
                "Check your rent & utility bill status",
                "View your stay timeline & trust score"
            ]
        }
    },
    howItWorks: {
        title: "How it works in 3 simple steps",
        step1: {
            title: "Register",
            desc: "Sign up as a Tenant or Landlord in seconds."
        },
        step2: {
            title: "Connect",
            desc: "Tenants find landlords, submit details, and get verified."
        },
        step3: {
            title: "Manage",
            desc: "Track rent, bills, and stay history from your dashboard."
        }
    },
    testimonials: {
        title: "Trusted by people like you",
        card1: {
            quote: "PropAccura made tracking rent so simple! I used to use spreadsheets, but this is a game changer.",
            author: "Sarah Jenkins",
            role: "Landlord, 5 Properties"
        },
        card2: {
            quote: "Even my parents can manage properties now. It's so intuitive and the tenant verification is a lifesaver.",
            author: "Michael Chen",
            role: "Property Manager"
        }
    },
    faq: {
        title: "Frequently Asked Questions",
        q1: "How do tenants choose a landlord?",
        a1: "Tenants can search for registered landlords within the app and send a connection request to start their rental journey.",
        q2: "Is my data secure?",
        a2: "Yes, we use bank-level encryption and secure role-based access control to ensure your personal and financial data is protected.",
        q3: "What happens after I register?",
        a3: "You'll be taken to your dedicated dashboard where you can immediately start adding properties (as a landlord) or applying to stays (as a tenant)."
    },
    contact: {
        title: "Get in Touch",
        subtitle: "Have questions? We're here to help. Send us a message and we'll respond within 24 hours.",
        infoTitle: "Contact Information",
        form: {
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email Address",
            message: "Message",
            send: "Send Message"
        }
    },
    loginPage: {
        visualTitle: "How It Works",
        step1: {
            number: "1",
            text: "Create your account",
            subtext: "(Landlord or Tenant)"
        },
        step2: {
            number: "2",
            text: "Login securely and go to your dashboard"
        },
        welcomeTitle: "Welcome back",
        welcomeSubtitle: "Enter your credentials to access your account",
        roleLabel: "I am a",
        roles: {
            tenant: "Tenant",
            landlord: "Landlord"
        },
        emailLabel: "Email",
        passwordLabel: "Password",
        submitButton: "Sign in",
        loadingButton: "Signing in...",
        noAccount: "Don't have an account?",
        createAccount: "Create free account"
    },
    signupPage: {
        visualTitle: "Start your journey with PropAccura.",
        visualDesc: "Create an account today to streamline your rental experience, whether you're managing properties or finding your next home.",
        title: "Create an account",
        subtitle: "Enter your details to get started",
        roleLabel: "I am a",
        roles: {
            tenant: "Tenant",
            landlord: "Landlord"
        },
        nameLabel: "Full Name",
        emailLabel: "Email Address",
        passwordLabel: "Strong Password",
        passwordHint: "Min 8 chars, A-z, 0-9, and special char (!@#$)",
        submitButton: "Create Account",
        loadingButton: "Creating account...",
        existingAccount: "Already have an account?",
        signIn: "Sign in"
    },
    footer: {
        description: "Simplifying property management for landlords and tenants with trust, transparency, and technology.",
        platform: "Platform",
        reachUs: "Reach Us",
        social: "Social Media",
        rights: "All rights reserved."
    }
};

export type Translations = typeof en;
