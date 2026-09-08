const account = {
  login: {
    title: "Hyr n'llogari",
    submit: "Hyr",
    fjalekalimi: "Fjalëkalimi",
    skeLlogari: "S'ke llogari?",
    regjistrohuKetu: "Regjistrohu këtu",
  },

  register: {
    title: "Krijo llogari",
    uRegjistrove:
      "U regjistrove! Kontrollo email-in tand për me e konfirmu llogarinë, mandej hyr n'llogari.",
    emriMbiemri: "Emri e Mbiemri",
    numriTelefonit: "Numri i telefonit (p.sh. 04X XXX XXX)",
    fjalekalimi: "Fjalëkalimi (min. 6 shkronja)",
    submit: "Regjistrohu",
    keLlogari: "Ke tashmë llogari?",
    hyrKetu: "Hyr këtu",
  },

  page: {
    title: "Llogaria ime",
    fotoProfilit: "Foto e profilit",
    tDhanatProfilit: "T'dhanat e profilit",
    ndryshoEmailin: "Ndrysho email-in",
    ndryshoFjalekalimin: "Ndrysho fjalëkalimin",
  },

  editProfile: {
    uRuajt: "U ruajt me sukses!",
    emriMbiemri: "Emri e Mbiemri",
    numriTelefonit: "Numri i telefonit",
    telefoniPlaceholder: "p.sh. 044 123 456",
    telefoniHint: "Ky numër përdoret për butonat WhatsApp/Viber n'listimet tua.",
    dukeRuejt: "Duke ruejt...",
    ruajNdryshimet: "Ruaj ndryshimet",
  },

  changePassword: {
    tShkurter: "Fjalëkalimi duhesh me pas t'paktën 6 shkronja/numra.",
    sPerputhen: "Fjalëkalimet s'përputhen.",
    uNdryshua: "Fjalëkalimi u ndryshua me sukses!",
    fjalekalimiRi: "Fjalëkalimi i ri",
    perseriteFjalekalimin: "Përsërite fjalëkalimin",
    dukeNdryshu: "Duke ndryshu...",
    ndryshoFjalekalimin: "Ndrysho fjalëkalimin",
  },

  changeEmail: {
    uDergua:
      "Të dërguem një email konfirmimi te {email}. Emaili yt ndryshon vetëm pasi me klikue linkun aty.",
    emailAktual: "Email aktual",
    emailIRi: "Email i ri",
    dukeDergu: "Duke dërgu...",
    ndryshoEmailin: "Ndrysho email-in",
  },

  avatar: {
    vetemFoto: "Zgjedh vetëm nji foto (jpg, png...).",
    shumeMadhe: "Foto âsht shumë e madhe (max 3MB).",
    dukeNgarku: "Duke ngarku...",
    ndryshoFoton: "Ndrysho foton",
  },
} as const;

export default account;
