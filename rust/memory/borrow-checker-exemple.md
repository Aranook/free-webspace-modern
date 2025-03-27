# Gestion des Accès Concurrents en Rust : L'Analogie du Bocal de Bonbons 🍬

## Imagine un bocal de bonbons partagé entre plusieurs enfants

Tu as un grand **bocal de bonbons** sur la table. Plusieurs enfants veulent y piocher des bonbons, mais s'ils ne suivent pas certaines règles, cela peut poser problème :

- **Deux enfants prennent le même bonbon en même temps** → Résultat : conflit !
- **Un enfant prend un bonbon alors qu'il n'y en a plus** → Résultat : erreur !
- **Tous les enfants se précipitent sur le bocal et se bousculent** → Résultat : chaos total !

## Problème des accès concurrents
En programmation, c'est exactement ce qui se passe lorsque plusieurs threads accèdent à une même ressource partagée **sans synchronisation**. Pour éviter les erreurs, on doit organiser l'accès de manière sécurisée.

## Solution : Des règles pour organiser l'accès au bocal
Pour résoudre ce problème, on peut mettre en place quelques règles :

1. **Un seul enfant peut ouvrir le bocal à la fois** → *Mutex*
2. **Chaque enfant doit attendre son tour pour prendre un bonbon** → *File d'attente*
3. **Le bocal doit être partagé entre tous les enfants** → *Référence comptée (Arc)*

En Rust, ces concepts sont représentés par des outils comme `Mutex<T>` et `Arc<T>`.

## Implémentation en Rust

Voici comment on peut coder cette situation en Rust avec plusieurs threads accédant à un même compteur (qui représente le nombre de bonbons pris) en toute sécurité.

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let bonbons = Arc::new(Mutex::new(10)); // Le bocal contient 10 bonbons
    let mut enfants = vec![];

    for _ in 0..5 {
        let bonbons = Arc::clone(&bonbons);
        let enfant = thread::spawn(move || {
            let mut bocal = bonbons.lock().unwrap();
            if *bocal > 0 {
                *bocal -= 1;
                println!("Un enfant prend un bonbon. Restant : {}", *bocal);
            } else {
                println!("Plus de bonbons !");
            }
        });
        enfants.push(enfant);
    }

    for enfant in enfants {
        enfant.join().unwrap();
    }

    println!("Bonbons restants dans le bocal : {}", *bonbons.lock().unwrap());
}
```

## Résumé Final
- **Le bocal de bonbons** = Ressource partagée
- **Les enfants** = Threads
- **Le couvercle du bocal (Mutex)** = Empêche plusieurs accès simultanés
- **La carte du parc (Arc)** = Permet de partager le bocal entre tous

### Résultat attendu (exemple de sortie)
```
Un enfant prend un bonbon. Restant : 9
Un enfant prend un bonbon. Restant : 8
Un enfant prend un bonbon. Restant : 7
Un enfant prend un bonbon. Restant : 6
Un enfant prend un bonbon. Restant : 5
Bonbons restants dans le bocal : 5
```

Rust nous assure que tout fonctionne **sans conflit** et **sans accès concurrent dangereux**. 🎉
