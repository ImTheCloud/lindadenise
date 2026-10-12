// Prix et conditions des toiles : à changer ici seulement (les textes FR et NL les reprennent).
// Les vidéos ne montrent ni prix ni offre de lot.
export const PRIX_TOILE = 200;
// Moyenne arrondie des tarifs d'un colis de 2 kg livré à domicile en Belgique (voir docs/avancement.md).
export const FRAIS_ENVOI = 12;
export const ENVOI_OFFERT_DES = 2;
// Offre de lot, sur les toiles seulement (pas sur les dessins numériques) : 5 achetées, la 6e offerte.
export const TOILES_ACHETEES = 5;
// Délais donnés par Linda : envoi par bpost d'une toile déjà imprimée, création et envoi d'une toile sur commande.
export const DELAI_ENVOI = { fr: '1 à 2 semaines', nl: '1 tot 2 weken' };
export const DELAI_TOILE_SUR_COMMANDE = { fr: 'environ 1 à 3 semaines, création et envoi compris', nl: 'ongeveer 1 tot 3 weken, aanmaak en verzending inbegrepen' };

export function calculLot(nombre: number) {
  const sousTotal = nombre * PRIX_TOILE;
  const offertes = Math.floor(nombre / (TOILES_ACHETEES + 1));
  const envoi = nombre === 0 || nombre >= ENVOI_OFFERT_DES ? 0 : FRAIS_ENVOI;
  return { nombre, sousTotal, offertes, envoi, total: sousTotal - offertes * PRIX_TOILE + envoi };
}
