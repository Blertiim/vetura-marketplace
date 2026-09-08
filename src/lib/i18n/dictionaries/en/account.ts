const account = {
  login: {
    title: "Log in",
    submit: "Log in",
    fjalekalimi: "Password",
    skeLlogari: "Don't have an account?",
    regjistrohuKetu: "Sign up here",
  },

  register: {
    title: "Create an account",
    uRegjistrove:
      "You're registered! Check your email to confirm your account, then log in.",
    emriMbiemri: "Full name",
    numriTelefonit: "Phone number (e.g. 04X XXX XXX)",
    fjalekalimi: "Password (min. 6 characters)",
    submit: "Sign up",
    keLlogari: "Already have an account?",
    hyrKetu: "Log in here",
  },

  page: {
    title: "My account",
    fotoProfilit: "Profile photo",
    tDhanatProfilit: "Profile details",
    ndryshoEmailin: "Change email",
    ndryshoFjalekalimin: "Change password",
  },

  editProfile: {
    uRuajt: "Saved successfully!",
    emriMbiemri: "Full name",
    numriTelefonit: "Phone number",
    telefoniPlaceholder: "e.g. 044 123 456",
    telefoniHint: "This number is used for the WhatsApp/Viber buttons on your listings.",
    dukeRuejt: "Saving...",
    ruajNdryshimet: "Save changes",
  },

  changePassword: {
    tShkurter: "Password must be at least 6 characters.",
    sPerputhen: "Passwords don't match.",
    uNdryshua: "Password changed successfully!",
    fjalekalimiRi: "New password",
    perseriteFjalekalimin: "Confirm new password",
    dukeNdryshu: "Changing...",
    ndryshoFjalekalimin: "Change password",
  },

  changeEmail: {
    uDergua:
      "We sent a confirmation email to {email}. Your email only changes once you click the link there.",
    emailAktual: "Current email",
    emailIRi: "New email",
    dukeDergu: "Sending...",
    ndryshoEmailin: "Change email",
  },

  avatar: {
    vetemFoto: "Please choose an image file (jpg, png...).",
    shumeMadhe: "The photo is too large (max 3MB).",
    dukeNgarku: "Uploading...",
    ndryshoFoton: "Change photo",
  },
} as const;

export default account;
