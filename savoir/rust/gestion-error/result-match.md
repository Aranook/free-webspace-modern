# Bonne gestion des erreurs avec `Result<T, E>` en Rust

Rust fournit le type `Result<T, E>` pour gérer les erreurs de manière robuste et expressive. Ce type permet de représenter soit un succès (`Ok(T)`) soit une erreur (`Err(E)`), évitant ainsi les erreurs silencieuses et facilitant la gestion explicite des erreurs.

## Syntaxe de `Result<T, E>`

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

- `T` représente la valeur de retour en cas de succès.
- `E` représente le type d'erreur.

### Déclaration de fonction retournant un `Result`

Une fonction peut retourner un `Result` pour signaler le succès ou l'échec d'une opération :

```rust
fn diviser(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("Division par zéro"))
    } else {
        Ok(a / b)
    }
}
```

### Utilisation de `match` avec `Result`

L'instruction `match` permet de traiter les deux cas (`Ok` et `Err`) de manière explicite :

```rust
match diviser(10.0, 2.0) {
    Ok(result) => println!("Résultat: {}", result),
    Err(error) => println!("Erreur: {}", error),
}
```

### Utilisation de l'opérateur `?` pour la propagation des erreurs

L'opérateur `?` permet de simplifier la propagation des erreurs en évitant un `match` explicite :

```rust
fn lire_fichier(nom: &str) -> Result<String, std::io::Error> {
    let contenu = std::fs::read_to_string(nom)?;
    Ok(contenu)
}
```

## Utilisation de `Result<T, E>`

L'utilisation de `Result<T, E>` est essentielle pour assurer une gestion des erreurs robuste. On peut propager les erreurs, les gérer localement ou les convertir en d'autres types d'erreurs.

### Exemple détaillé : division sécurisée

Dans cet exemple, on utilise `Result` pour éviter une division par zéro :

```rust
fn division(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("Division par zéro"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    let resultat = division(10.0, 0.0);
    match resultat {
        Ok(valeur) => println!("Résultat: {}", valeur),
        Err(message) => println!("Erreur: {}", message),
    }
}
```

## Utilisation de `Result` avec `match` (Bonne pratique)

L'utilisation de `match` est recommandée pour traiter explicitement les cas de succès et d'erreur. Voici quelques bonnes pratiques :

### 1. Manipulation explicite avec `match`

Lorsque vous manipulez un `Result`, utilisez `match` pour garantir une gestion correcte des erreurs :

```rust
fn lire_fichier(nom: &str) -> Result<String, std::io::Error> {
    std::fs::read_to_string(nom)
}

fn main() {
    match lire_fichier("test.txt") {
        Ok(contenu) => println!("Contenu du fichier: {}", contenu),
        Err(e) => eprintln!("Erreur de lecture: {}", e),
    }
}
```

### 2. Utilisation de `unwrap_or_else` pour gérer les erreurs de manière concise

L'utilisation de `unwrap_or_else` permet d'afficher un message par défaut en cas d'erreur :

```rust
fn main() {
    let contenu = std::fs::read_to_string("test.txt").unwrap_or_else(|_| "Fichier introuvable".to_string());
    println!("{}", contenu);
}
```

### 3. Propagation des erreurs avec `?`

L'opérateur `?` permet de simplifier le code en renvoyant directement l'erreur à l'appelant :

```rust
fn lire_fichier(nom: &str) -> Result<String, std::io::Error> {
    let contenu = std::fs::read_to_string(nom)?;
    Ok(contenu)
}
```

### 4. Mapping des erreurs avec `map_err`

`map_err` permet de transformer une erreur en une chaîne de caractères plus lisible :

```rust
fn main() {
    let result = std::fs::read_to_string("test.txt")
        .map_err(|e| format!("Erreur rencontrée: {}", e));
    
    match result {
        Ok(contenu) => println!("Fichier lu: {}", contenu),
        Err(e) => eprintln!("Erreur: {}", e),
    }
}
```

## Conclusion

L'utilisation de `Result<T, E>` avec `match` en Rust est une bonne pratique pour assurer un code robuste et explicite. Les erreurs sont gérées proprement, évitant ainsi les plantages inattendus. Les techniques comme `unwrap_or_else`, `?` et `map_err` permettent d'améliorer la lisibilité et la maintenabilité du code. En maîtrisant ces concepts, vous pourrez écrire du code Rust fiable et sécurisé.
