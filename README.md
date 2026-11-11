# Encrenca! · Fichas (extensão do Owlbear Rodeo)

Cada jogador edita a própria ficha; o mestre vê um resumo de todas e pode abrir e editar qualquer uma.
Inclui kit de raça/classe do PDF, subir de nível, descansos e rolagem de atributos (1d20 + número do atributo,
vantagem/desvantagem, perícia +2, natural 1 = Encrenca!). As rolagens aparecem para a mesa toda.

> Mecânica dos atributos desta versão: cada atributo é um número (no início, o jogador rola 1d4 para cada um).
> Isso difere do PDF original, que usava dados de d4 a d12.

## Arquivos

- `manifest.json`: descreve a extensão para o Owlbear.
- `index.html` e `app.js`: a ficha em si.
- `icon.svg`: ícone do botão.
- `_headers`: só é usado em Cloudflare Pages e Netlify (libera o acesso do Owlbear). No GitHub Pages não precisa.

## 1) Colocar no ar (grátis) com o GitHub Pages

1. Crie uma conta em github.com e um repositório **público** novo, por exemplo `encrenca-fichas`.
2. Na página do repositório, escolha **Add file > Upload files** e envie `index.html`, `app.js`,
   `manifest.json` e `icon.svg`. Confirme com **Commit changes**.
3. Vá em **Settings > Pages**. Em *Build and deployment*, escolha **Deploy from a branch**,
   branch `main`, pasta `/ (root)`, e salve.
4. Espere um ou dois minutos. O endereço será parecido com
   `https://SEU-USUARIO.github.io/encrenca-fichas/manifest.json`.
   Abra esse link no navegador: deve aparecer o texto do manifest.

Alternativa: Cloudflare Pages (Workers & Pages > Create > Pages > Upload assets), enviando todos os arquivos.

## 2) Instalar no Owlbear Rodeo

1. No Owlbear, abra o seu **perfil** e use **Add Extension**, colando o endereço do `manifest.json`.
2. Crie uma sala nova e **ative a extensão** na tela de criação da sala.
3. Dentro da sala, o botão da extensão aparece no canto superior esquerdo.
   Todos os jogadores da sala conseguem usá-la; ninguém precisa instalar nada.

## 3) Como usar

- **Jogador:** clica em *Criar minha ficha*, escolhe raça e classe (as listas vêm do PDF) e usa
  *Aplicar kit da raça/classe*. Depois rola 1d4 para cada atributo (botão d4), soma +1 conforme a raça
  (botão +1) e preenche o resto. O kit só aparece no nível 1, para não apagar uma ficha em andamento.
- **Mestre:** vê no topo um cartão por jogador (Nível, Vida, PM e Sorte), toca num deles para abrir a ficha
  e pode criar a ficha de quem ainda não tem.
- Tudo é salvo sozinho. O mestre também vê quanto do espaço da sala já foi usado.

## Limites e cuidados

- A separação "cada um vê a sua" é feita pela interface, não por segurança. Os dados ficam nos metadados da sala.
- A sala guarda no máximo 16 kB de metadados no total (compartilhado com outras extensões, como as de dados).
  Uma ficha comum usa cerca de 0,5 a 1 kB. Se aparecer "não consegui salvar", enxugue os textos longos.
- Uma cópia de cada ficha é guardada também no navegador de quem a edita, e há um botão para restaurá-la
  caso a ficha suma da sala.
- O SDK do Owlbear é carregado da internet (versão 3.1.0 fixa). Se o botão abrir uma tela de erro, confira a conexão.
- Se o ícone ou a ficha não carregarem, troque no `manifest.json` os caminhos `icon.svg` e `index.html`
  pelos endereços completos (por exemplo, `https://SEU-USUARIO.github.io/encrenca-fichas/index.html`).

## Atualizar

Envie os arquivos novos ao repositório. O Owlbear carrega a versão mais recente na próxima vez que abrir a sala.
