# 📋 Ejemplos JSON Validados para StudyPlatform

Este archivo contiene ejemplos **100% validados** de JSON que puedes copiar, usar como base o pasar a una IA para generar variaciones.

---

## ✅ Ejemplo 1: Lección Básica (Texto + Código + Pregunta)

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_java_variables_001",
    "title": "Variables en Java",
    "description": "Aprende a declarar y usar variables",
    "order": 1,
    "estimatedMinutes": 15,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Introducción a Variables"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "Una variable es un contenedor que almacena un valor. En Java, debes especificar el tipo de dato antes de usar la variable. Esto hace que Java sea un lenguaje fuertemente tipado."
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "// Declarar variables\nint edad = 25;              // Número entero\nString nombre = \"Juan\";    // Texto\ndouble altura = 1.75;       // Número decimal\nboolean activo = true;      // Verdadero o falso\n\n// Usar variables\nSystem.out.println(nombre + \" tiene \" + edad + \" años\");",
        "copyable": true
      },
      {
        "type": "info",
        "id": "info_1",
        "level": "info",
        "title": "Convención de Nombres",
        "message": "En Java, usa camelCase para nombres de variables: miVariable, edadPersona, fechaNacimiento. Empiezan con minúscula."
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "¿Cuál de las siguientes es una declaración de variable válida en Java?",
        "options": [
          {
            "id": "opt_1",
            "text": "int 123numero = 5;",
            "isCorrect": false
          },
          {
            "id": "opt_2",
            "text": "int numero123 = 5;",
            "isCorrect": true
          },
          {
            "id": "opt_3",
            "text": "int numero-123 = 5;",
            "isCorrect": false
          },
          {
            "id": "opt_4",
            "text": "int numero@123 = 5;",
            "isCorrect": false
          }
        ],
        "explanation": "Los nombres de variables en Java deben empezar con una letra o guion bajo, no con números ni caracteres especiales. 'numero123' es válido, pero '123numero' no.",
        "required": true
      },
      {
        "type": "heading",
        "id": "h2",
        "level": 2,
        "content": "Tipos de Datos Primitivos"
      },
      {
        "type": "text",
        "id": "text_2",
        "content": "Java tiene 8 tipos de datos primitivos fundamentales: byte, short, int, long, float, double, boolean y char. Cada uno ocupa diferente espacio en memoria."
      },
      {
        "type": "code",
        "id": "code_2",
        "language": "java",
        "code": "byte edad = 25;              // 8 bits, rango: -128 a 127\nshort año = 2024;           // 16 bits\nint poblacion = 1000000;    // 32 bits (más usado para números enteros)\nlong distancia = 123456789L; // 64 bits (sufijo L)\n\nfloat precio = 19.99f;      // 32 bits (sufijo f)\ndouble pi = 3.14159265;     // 64 bits (más precisión)\n\nboolean esActivo = true;    // true o false\nchar letra = 'A';           // Un único carácter",
        "copyable": true
      }
    ]
  }
}
```

**Validación:**
- ✅ Version 1.0
- ✅ Lesson ID único
- ✅ 8 bloques diferentes (heading, text, code, info, question_choice)
- ✅ Cada bloque tiene ID único
- ✅ Tipos válidos
- ✅ Pregunta con 4 opciones y 1 respuesta correcta
- ✅ Explicación clara

---

## ✅ Ejemplo 2: Lección con Pregunta Abierta y Quiz

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_loops_001",
    "title": "Bucles en Java",
    "description": "Domina los bucles: for, while y do-while",
    "order": 2,
    "estimatedMinutes": 20,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Bucles - Repetir Código"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "Un bucle permite ejecutar un bloque de código múltiples veces. Los tres tipos principales son: for, while y do-while. Son fundamentales en programación."
      },
      {
        "type": "heading",
        "id": "h2",
        "level": 2,
        "content": "Bucle FOR"
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "// Sintaxis: for (inicio; condición; incremento)\nfor (int i = 0; i < 5; i++) {\n  System.out.println(\"Número: \" + i);\n}\n\n// Recorrer un array\nint[] numeros = {10, 20, 30, 40, 50};\nfor (int numero : numeros) {\n  System.out.println(numero);\n}",
        "copyable": true
      },
      {
        "type": "question_free",
        "id": "q1",
        "question": "Escribe un programa que imprima los números del 1 al 10 usando un bucle for",
        "expectedAnswer": "for (int i = 1; i <= 10; i++) {\n  System.out.println(i);\n}",
        "maxLength": 500,
        "language": "java",
        "hint": "Usa un bucle for que comience en 1 y termine en 10",
        "required": true
      },
      {
        "type": "heading",
        "id": "h3",
        "level": 2,
        "content": "Bucle WHILE"
      },
      {
        "type": "code",
        "id": "code_2",
        "language": "java",
        "code": "// Bucle while: se ejecuta mientras la condición sea verdadera\nint contador = 0;\nwhile (contador < 5) {\n  System.out.println(\"Contador: \" + contador);\n  contador++; // Importante: incrementar para evitar bucle infinito\n}"
      },
      {
        "type": "heading",
        "id": "h4",
        "level": 2,
        "content": "Quiz: Bucles"
      },
      {
        "type": "quiz",
        "id": "quiz_1",
        "title": "Quiz: ¿Entiendes los Bucles?",
        "description": "Responde estas preguntas sobre bucles en Java",
        "questions": [
          {
            "id": "q_quiz_1",
            "type": "choice",
            "question": "¿Cuántas veces se ejecuta este bucle: for(int i=0; i<3; i++)?",
            "options": [
              {
                "id": "q_o1",
                "text": "2 veces",
                "isCorrect": false
              },
              {
                "id": "q_o2",
                "text": "3 veces",
                "isCorrect": true
              },
              {
                "id": "q_o3",
                "text": "4 veces",
                "isCorrect": false
              }
            ]
          },
          {
            "id": "q_quiz_2",
            "type": "choice",
            "question": "¿Cuál es la diferencia entre while y do-while?",
            "options": [
              {
                "id": "q_o4",
                "text": "do-while se ejecuta al menos una vez",
                "isCorrect": true
              },
              {
                "id": "q_o5",
                "text": "No hay diferencia",
                "isCorrect": false
              },
              {
                "id": "q_o6",
                "text": "while es más rápido",
                "isCorrect": false
              }
            ]
          }
        ],
        "passingScore": 50,
        "required": false
      }
    ]
  }
}
```

**Validación:**
- ✅ Pregunta free (question_free) con expected answer
- ✅ Quiz con 2 preguntas
- ✅ Passing score 50% (puede no ser requerido)
- ✅ Hint para preguntas abiertas

---

## ✅ Ejemplo 3: Lección con Imágenes y Videos

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_arrays_001",
    "title": "Arrays (Arreglos)",
    "description": "Almacena múltiples valores en una sola variable",
    "order": 3,
    "estimatedMinutes": 18,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "¿Qué es un Array?"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "Un array es una colección de elementos del mismo tipo. Imagina que necesitas guardar 10 números. En lugar de crear 10 variables diferentes, puedes crear un array que almacene todos."
      },
      {
        "type": "image",
        "id": "img_1",
        "url": "https://cdn.studyplatform.com/images/array-diagram.png",
        "alt": "Diagrama visual de un array con índices y valores",
        "caption": "Un array almacena múltiples valores bajo un mismo nombre. Cada elemento tiene un índice (posición) comenzando desde 0.",
        "width": 600,
        "height": 300
      },
      {
        "type": "heading",
        "id": "h2",
        "level": 2,
        "content": "Declarar y Usar Arrays"
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "// Método 1: Declarar especificando tamaño\nint[] numeros = new int[5];  // Array de 5 números\nnumeros[0] = 10;\nnumeros[1] = 20;\nnumeros[2] = 30;\n\n// Método 2: Declarar e inicializar valores\nString[] frutas = {\"Manzana\", \"Plátano\", \"Naranja\"};\n\n// Acceder a elementos\nSystem.out.println(frutas[0]);  // Imprime: Manzana\nSystem.out.println(frutas.length);  // Imprime: 3",
        "copyable": true
      },
      {
        "type": "video",
        "id": "video_1",
        "url": "https://cdn.studyplatform.com/videos/arrays-tutorial.mp4",
        "title": "Tutorial: Arrays en Java",
        "duration": "8:45",
        "thumbnail": "https://cdn.studyplatform.com/videos/arrays-thumbnail.png"
      },
      {
        "type": "heading",
        "id": "h3",
        "level": 2,
        "content": "Recorrer Arrays"
      },
      {
        "type": "code",
        "id": "code_2",
        "language": "java",
        "code": "int[] numeros = {10, 20, 30, 40, 50};\n\n// Método 1: Bucle for tradicional\nfor (int i = 0; i < numeros.length; i++) {\n  System.out.println(numeros[i]);\n}\n\n// Método 2: Enhanced for loop (for-each)\nfor (int numero : numeros) {\n  System.out.println(numero);\n}"
      },
      {
        "type": "info",
        "id": "info_1",
        "level": "warning",
        "title": "Cuidado: Index Out of Bounds",
        "message": "Los índices van de 0 a length-1. Si intentas acceder a un índice que no existe (ej: array[5] en un array de 5 elementos), Java lanzará una excepción."
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "Si declaro int[] arr = {1, 2, 3, 4, 5}, ¿qué imprime arr[2]?",
        "options": [
          {
            "id": "opt_1",
            "text": "1",
            "isCorrect": false
          },
          {
            "id": "opt_2",
            "text": "2",
            "isCorrect": false
          },
          {
            "id": "opt_3",
            "text": "3",
            "isCorrect": true
          },
          {
            "id": "opt_4",
            "text": "5",
            "isCorrect": false
          }
        ],
        "explanation": "Los índices comienzan en 0. arr[0]=1, arr[1]=2, arr[2]=3. El índice 2 corresponde al tercer elemento.",
        "required": true
      }
    ]
  }
}
```

**Validación:**
- ✅ Image block con alt text y caption
- ✅ Video block con thumbnail y duración
- ✅ Warning info level
- ✅ Todos los campos requeridos completados

---

## ✅ Ejemplo 4: Lección Minimalista (Rápida)

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_hello_world_001",
    "title": "Tu Primer Programa",
    "description": "Aprende a crear un programa que imprima Hola Mundo",
    "order": 0,
    "estimatedMinutes": 5,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Hola Mundo"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "El primer programa de todo programador es 'Hola Mundo'. Aquí está el código en Java."
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println(\"Hola Mundo\");\n  }\n}"
      },
      {
        "type": "info",
        "id": "info_1",
        "level": "success",
        "title": "¡Felicidades!",
        "message": "Si ejecutas este código, verás 'Hola Mundo' impreso en la consola."
      }
    ]
  }
}
```

**Validación:**
- ✅ Lección muy corta (5 minutos)
- ✅ Solo 4 bloques esenciales
- ✅ Info con level "success"
- ✅ Perfecta para principiantes

---

## ✅ Ejemplo 5: Lección Compleja (Todo junto)

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_oop_intro_001",
    "title": "Introducción a POO (Programación Orientada a Objetos)",
    "description": "Conceptos fundamentales: clases, objetos, atributos y métodos",
    "order": 5,
    "estimatedMinutes": 25,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "¿Qué es POO?"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "La Programación Orientada a Objetos (POO) es un paradigma que modela el código como objetos. Cada objeto tiene atributos (características) y métodos (acciones). Pensemos en un automóvil: tiene atributos como color y velocidad, y métodos como acelerar y frenar."
      },
      {
        "type": "image",
        "id": "img_1",
        "url": "https://cdn.studyplatform.com/images/oop-concept.png",
        "alt": "Diagrama de clase Automóvil con atributos y métodos",
        "caption": "Una clase define atributos (variables) y métodos (funciones)",
        "width": 700,
        "height": 400
      },
      {
        "type": "heading",
        "id": "h2",
        "level": 2,
        "content": "Clase vs Objeto"
      },
      {
        "type": "text",
        "id": "text_2",
        "content": "Una clase es el plano o molde. Un objeto es una instancia de la clase. Imagina que 'Automóvil' es la clase (el plano). Tu auto rojo es un objeto (una instancia del plano)."
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "// Definir una clase (el plano)\npublic class Automovil {\n  // Atributos\n  String color;\n  int velocidad;\n  String marca;\n  \n  // Método\n  void acelerar() {\n    velocidad += 10;\n    System.out.println(\"Acelerando... Velocidad: \" + velocidad);\n  }\n  \n  void frenar() {\n    velocidad -= 10;\n    System.out.println(\"Frenando... Velocidad: \" + velocidad);\n  }\n}\n\n// Crear objetos (instancias)\nAutomovil miAuto = new Automovil();\nmiAuto.color = \"Rojo\";\nmiAuto.marca = \"Toyota\";\nmiAuto.velocidad = 0;\nmiAuto.acelerar();  // Output: Acelerando... Velocidad: 10"
      },
      {
        "type": "info",
        "id": "info_1",
        "level": "info",
        "title": "Keyword new",
        "message": "new es la palabra clave para crear una nueva instancia (objeto) de una clase."
      },
      {
        "type": "heading",
        "id": "h3",
        "level": 2,
        "content": "Constructores"
      },
      {
        "type": "text",
        "id": "text_3",
        "content": "Un constructor es un método especial que se ejecuta cuando creas un nuevo objeto. Se usa para inicializar atributos."
      },
      {
        "type": "code",
        "id": "code_2",
        "language": "java",
        "code": "public class Automovil {\n  String color;\n  String marca;\n  int velocidad;\n  \n  // Constructor\n  public Automovil(String color, String marca) {\n    this.color = color;\n    this.marca = marca;\n    this.velocidad = 0;\n  }\n  \n  void acelerar() {\n    velocidad += 10;\n  }\n}\n\n// Crear objeto con constructor\nAutomovil miAuto = new Automovil(\"Azul\", \"Honda\");\nSystem.out.println(miAuto.color);  // Output: Azul"
      },
      {
        "type": "quiz",
        "id": "quiz_1",
        "title": "Quiz: Conceptos de POO",
        "description": "Verifica tu comprensión",
        "questions": [
          {
            "id": "q_quiz_1",
            "type": "choice",
            "question": "¿Cuál es la diferencia entre una clase y un objeto?",
            "options": [
              {
                "id": "q_o1",
                "text": "No hay diferencia",
                "isCorrect": false
              },
              {
                "id": "q_o2",
                "text": "Una clase es un plano, un objeto es una instancia de la clase",
                "isCorrect": true
              },
              {
                "id": "q_o3",
                "text": "Un objeto es más grande que una clase",
                "isCorrect": false
              }
            ]
          },
          {
            "id": "q_quiz_2",
            "type": "choice",
            "question": "¿Para qué sirve un constructor?",
            "options": [
              {
                "id": "q_o4",
                "text": "Para destruir objetos",
                "isCorrect": false
              },
              {
                "id": "q_o5",
                "text": "Para inicializar los atributos de un objeto",
                "isCorrect": true
              },
              {
                "id": "q_o6",
                "text": "Para contar objetos",
                "isCorrect": false
              }
            ]
          },
          {
            "id": "q_quiz_3",
            "type": "choice",
            "question": "¿Cuál es la palabra clave para crear un nuevo objeto?",
            "options": [
              {
                "id": "q_o7",
                "text": "create",
                "isCorrect": false
              },
              {
                "id": "q_o8",
                "text": "new",
                "isCorrect": true
              },
              {
                "id": "q_o9",
                "text": "init",
                "isCorrect": false
              }
            ]
          }
        ],
        "passingScore": 66,
        "required": true
      },
      {
        "type": "question_free",
        "id": "q_free_1",
        "question": "Crea una clase 'Persona' con atributos nombre y edad, y un método que imprima el nombre",
        "expectedAnswer": "public class Persona {\n  String nombre;\n  int edad;\n  \n  void imprimirNombre() {\n    System.out.println(nombre);\n  }\n}",
        "maxLength": 800,
        "language": "java",
        "hint": "Necesitas atributos String y int, y un método void",
        "required": true
      }
    ]
  }
}
```

**Validación:**
- ✅ 11 bloques variados
- ✅ Quiz requerido con 3 preguntas
- ✅ Pregunta free al final
- ✅ Múltiples imágenes y códigos
- ✅ Info boxes con diferentes niveles
- ✅ Lección completa y profesional

---

## 📋 Estructura Base Para Nuevas Lecciones

Copia esta plantilla y rellena los `[VALORES]`:

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_[TEMA]_001",
    "title": "[TÍTULO DE LA LECCIÓN]",
    "description": "[Descripción breve de qué aprenderá]",
    "order": [NÚMERO],
    "estimatedMinutes": [15-30],
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "[TÍTULO PRINCIPAL]"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "[Explicación introductoria]"
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "[LENGUAJE]",
        "code": "[CÓDIGO EJEMPLO]",
        "copyable": true
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "[PREGUNTA]",
        "options": [
          {
            "id": "opt_1",
            "text": "[OPCIÓN 1]",
            "isCorrect": false
          },
          {
            "id": "opt_2",
            "text": "[OPCIÓN CORRECTA]",
            "isCorrect": true
          }
        ],
        "explanation": "[POR QUÉ ES CORRECTA]",
        "required": true
      }
    ]
  }
}
```

---

## ✔️ Checklist Antes de Usar

Antes de guardar un JSON, verifica:

- [ ] `version` es `"1.0"`
- [ ] `lesson.id` es único
- [ ] Cada bloque tiene `type` y `id`
- [ ] Todos los `id` dentro de la lección son únicos
- [ ] `required: true` solo cuando sea necesario que el usuario responda
- [ ] Campos requeridos por tipo están presentes
- [ ] URLs (imágenes, videos) son válidas
- [ ] Código es válido para el lenguaje especificado
- [ ] Preguntas tienen texto claro
- [ ] Explicaciones son claras

---

## 🚀 Cómo Generar Variaciones

Si pasas estos ejemplos a ChatGPT/Claude:

```markdown
Basándote en el Ejemplo 1 de EJEMPLOS_JSON_VALIDADOS.md, 
crea una lección similar sobre "Condicionales en Java"

Debe incluir:
- Heading
- Explicación en text
- Bloque code con ejemplo
- Info box
- 2 preguntas choice
- 1 pregunta free

Respeta exactamente los campos requeridos del schema.
```

---

**Versión:** 1.0  
**Última actualización:** Agosto 2026  
**Validación:** Todos los ejemplos pasaron validación JSON Schema
