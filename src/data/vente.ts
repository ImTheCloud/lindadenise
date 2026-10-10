// Prix et conditions des toiles : à changer ici seulement (les textes FR et NL les reprennent).
export const PRIX_TOILE = 200;
// Moyenne arrondie des tarifs d'un colis de 2 kg livré à domicile en Belgique (voir docs/avancement.md).
export const FRAIS_ENVOI = 12;
export const ENVOI_OFFERT_DES = 2;
// Remise de lot, sur les toiles seulement (pas sur les dessins numériques).
export const REMISES = [
  { des: 3, pourcent: 20 },
  { des: 2, pourcent: 10 },
];
// Délai d'une toile sur commande, quand Linda l'aura donné (ex. « environ 3 semaines »). Vide : texte de repli.
export const DELAI_TOILE_SUR_COMMANDE = { fr: '', nl: '' };

export function calculLot(nombre: number) {
  const sousTotal = nombre * PRIX_TOILE;
  const pourcent = REMISES.find((r) => nombre >= r.des)?.pourcent ?? 0;
  const remise = Math.round((sousTotal * pourcent) / 100);
  const envoi = nombre === 0 || nombre >= ENVOI_OFFERT_DES ? 0 : FRAIS_ENVOI;
  return { nombre, sousTotal, pourcent, remise, envoi, total: sousTotal - remise + envoi };
}
