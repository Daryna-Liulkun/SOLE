# Audit Report

## Style Drift
| Що | Знайдені значення | Рекомендований токен |
| :--- | :--- | :--- |
| Light Backgrounds | `#F5F5F5`, `#eee`, `#ccc`, `#D9D9D9`, `#d8d8d8`, `#eee` | `--color-light-gray` (`#F5F5F5`) |
| Section Headings | `45px`, `32px`, `30px`, `24px` | `--font-size-xl` (`45px`) |
| Card Radius | `8px`, `10px`, `12px` | `--radius-md` (`8px`) |
| Shadow Colors | `rgba(0,0,0,0.25)`, `rgba(0,0,0,0.1)`, `rgba(221, 92, 0, 0.25)` | `--shadow-default` |

## Топ хардкоди
| Значення | Кількість | Рекомендація |
| :--- | :--- | :--- |
| `74px` (padding) | 6+ | `--section-padding` |
| `#000000` (color) | 10+ | `--color-black` (or use `--color-dark`) |
| `15px` (gap/padding) | 8+ | `--space-sm` |
| `8px` (radius) | 5+ | `--radius-md` |

## План Storybook-First рефакторингу
Які компоненти потребують виносу в Storybook у першу чергу:
1. **Токени**: Створення `tokens.css` з CSS-змінними.
2. **Атоми**: 
   - `Button`
   - `SectionHeading`
   - `Icon`
3. **Молекули**:
   - `Card` (з варіантами для Story, Service, Material)
   - `FormInput`
4. **Організми**:
   - `Section` (wrapper з відступами та фоном)
   - `NavBar`

## Підсумок
Знайдено **23+** унікальних кольорових значень (багато з яких є дріфтом одного і того ж сірого) та **15+** повторюваних UI-патернів, які можна перетворити на компоненти. 

Запропоновано запустити `/atomic-refactor` для впровадження токенів.
