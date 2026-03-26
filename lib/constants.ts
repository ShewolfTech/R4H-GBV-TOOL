export function generateCaseRef(): string {
  const year = new Date().getFullYear();
  const num  = Math.floor(10000 + Math.random() * 90000);
  return `R4H-${year}-${num}`;
}

export const UGANDA_DISTRICTS: Record<string, string[]> = {
  Kampala:    ["Kampala Central","Kawempe","Makindye","Nakawa","Rubaga"],
  Wakiso:     ["Entebbe","Kira","Makindye-Ssabagabo","Nansana","Wakiso"],
  Mukono:     ["Mukono","Goma","Koome","Kyampisi","Ntenjeru"],
  Gulu:       ["Gulu","Awach","Koro","Lacor","Patiko"],
  Mbarara:    ["Mbarara","Biharwe","Kakoba","Kamukuzi","Nyamitanga"],
  Jinja:      ["Jinja","Bugembe","Kakira","Mpumudde","Walukuba"],
  Mbale:      ["Mbale","Bungokho","Bufumbo","Busiu","Wanale"],
  Lira:       ["Lira","Adekokwok","Agweng","Amach","Aromo"],
  Masaka:     ["Masaka","Buwunga","Kimanya-Kabonera","Nyendo-Mukungwe"],
  Soroti:     ["Soroti","Arapai","Gweri","Kamuda","Tubur"],
  Arua:       ["Arua","Ayivu","Ogoko","Pajulu","Vurra"],
  Hoima:      ["Hoima","Buhimba","Bugahya","Kigorobya","Kitoba"],
  Kabale:     ["Kabale","Bufundi","Ikumba","Kaharo","Rubanda"],
  Tororo:     ["Tororo","Kirewa","Molo","Mukuju","Paya"],
  FortPortal: ["Fort Portal","Bukuku","Busoro","Bunyangabu"],
};

export const AGE_RANGES       = ["Below 18","18–24","25–35","36–45","Above 45","Prefer not to say"];
export const GENDER_OPTIONS    = ["Woman","Man","Self-describe","Prefer not to say"];
export const DISABILITY_OPTIONS = ["None","Physical disability","Visual impairment","Hearing impairment","Psychosocial disability","Intellectual disability","Chronic illness","Other","Prefer not to say"];
export const VIOLENCE_TYPES    = ["Physical","Sexual","Emotional/Psychological","Economic","Digital/Online Abuse","Environmental / Climate-related","Other"];
export const DIGITAL_ABUSE_TYPES = ["Non-consensual images","Online stalking","Impersonation","Account takeover","Harassment","Doxxing","Other"];
export const PERPETRATOR_OPTIONS = ["Intimate partner","Family member","Community member","Employer","State actor","Religious/cultural leader","Unknown","Online-only / anonymous","Other"];
export const CONTRIBUTING_FACTORS = ["Gender inequality","Economic dependency","Harmful norms","Weak justice systems","Climate/environmental stress","Other"];
export const REPORTED_TO_OPTIONS  = ["Local leader","Police","Health facility","NGO/CBO","Safe shelter","Other"];
export const SUPPORT_SERVICES     = ["Medical","Psychosocial","Legal aid","Safe shelter","Livelihood support","None","Other"];
export const PRIORITY_SUPPORT     = ["Legal","Psychosocial","Medical","Safe shelter","Financial/livelihood","Advocacy","Other"];
export const CONTACT_METHODS      = ["Phone","Email","WhatsApp"];
export const RISK_ASSESSMENT_OPTIONS = ["Ongoing danger","Medical emergency","Child survivor","State actor involved","High digital risk"];
