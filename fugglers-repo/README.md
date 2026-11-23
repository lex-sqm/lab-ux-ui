# FUGGLERS — Rediseño UI/UX (Landing Page / One Page)

Taller HTML · Laboratorio UX/UI. Entrega individual: Figma + repositorio GitHub (GitHub Pages).
Proyecto académico, no es la tienda oficial. FUGGLER™ es marca de Libertas IP Limited.

- **Figma (Fase 1):** https://www.figma.com/design/z6KKkSOSobYd02RJFkwMhL
- **Sitio publicado (Fase 2):** https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/

## Fase 1 · Figma
- 3 páginas: Design System (colores, tipografía, componentes, grid y espaciado), Desktop 1920 y Mobile 393 (iPhone 16).
- Tokens como variables: Colors, Spacing y Typography (modos Desktop / Mobile).
- Atomic Design: átomos (botones, inputs, íconos, badges, chips) y moléculas/organismos (tarjetas de producto y categoría, header, footer).
- Parallax en 5 capas (0.1x · 0.3x · 0.6x · 0.8x · 1.0x), toast, modal y menú móvil.

## Fase 2 · HTML + CSS
- HTML5 semántico: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`; jerarquía `h1` → `h4`.
- CSS responsive con CSS Grid/posicionamiento y media queries (escritorio 1920 → móvil 393).
- Accesibilidad: contraste AA, `alt` descriptivos, foco visible, `label` en formularios, enlace "Saltar al contenido", `prefers-reduced-motion`.
- JavaScript: navegación por anclas con sección activa, carrusel (flechas, arrastre, puntos, autoplay), filtros del catálogo, carrito, búsqueda, vista rápida, formulario con validación, parallax por capas.

## Estructura
```
index.html   styles.css   script.js   img/
```

## Publicar
Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
