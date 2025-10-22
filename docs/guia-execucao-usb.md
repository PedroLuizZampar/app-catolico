# 🔧 Solucionando Problema de Detecção USB do Android

## ❌ Problema Atual
Celular conectado via USB, mas o comando `adb devices` não mostra nenhum dispositivo.

## ✅ Soluções (Siga nesta ordem)

### 1️⃣ **VERIFICAR NO CELULAR** (MAIS IMPORTANTE)

#### Ativar Modo Desenvolvedor:
1. Abra **Configurações**
2. Vá em **Sobre o telefone** (ou **Sistema** → **Sobre o telefone**)
3. Toque **7 vezes** em **"Número da versão"** ou **"Número de compilação"**
4. Você verá: "Agora você é um desenvolvedor!"

#### Ativar Depuração USB:
1. Volte para **Configurações**
2. Entre em **Opções do desenvolvedor** (ou **Sistema** → **Opções do desenvolvedor**)
3. **Ative** a chave "Opções do desenvolvedor" (no topo)
4. **Ative** "Depuração USB"
5. (Recomendado) **Ative** também "Instalar via USB"

#### Quando conectar o cabo:
- Uma mensagem deve aparecer: **"Permitir depuração USB?"**
- ✅ **MARQUE** "Sempre permitir neste computador"
- ✅ **TOQUE** em "Permitir" ou "OK"

⚠️ **Se a mensagem não aparecer**: Desconecte e reconecte o cabo USB

---

### 2️⃣ **VERIFICAR MODO USB NO CELULAR**

Quando conectar o cabo USB, arraste a barra de notificação para baixo e veja:

- **"Carregando via USB"** ou **"USB para carregamento"**
- Toque nessa notificação
- Mude para: **"Transferência de arquivos"** ou **"MTP"** ou **"PTP"**

❌ Não use: "Apenas carregar" ou "Sem transferência de dados"

---

### 3️⃣ **REINICIAR SERVIDOR ADB (NO WINDOWS)**

Execute estes comandos no PowerShell:

```powershell
# Matar o servidor ADB
adb kill-server

# Iniciar novamente
adb start-server

# Verificar dispositivos
adb devices
```

---

### 4️⃣ **TESTAR CABO E PORTA USB**

- ✅ Tente **outra porta USB** do computador (preferencialmente USB 3.0 - azul)
- ✅ Use porta USB **diretamente no computador** (não em hub USB)
- ✅ Tente **outro cabo USB** (alguns cabos só carregam, não transferem dados)
- ✅ **Limpe a porta USB** do celular (pode ter poeira)

---

### 5️⃣ **INSTALAR DRIVERS USB (Windows)**

#### Opção A: Drivers Universais Google
1. Baixe: [Google USB Driver](https://developer.android.com/studio/run/win-usb)
2. Extraia o arquivo
3. Abra **Gerenciador de Dispositivos** (Win + X → Gerenciador de Dispositivos)
4. Procure por dispositivo com **⚠️ amarelo** ou "Dispositivo desconhecido"
5. Clique com botão direito → **Atualizar driver**
6. Escolha **"Procurar drivers no computador"**
7. Aponte para a pasta extraída

#### Opção B: Drivers do Fabricante
Baixe os drivers específicos do seu celular:
- **Samsung**: [Samsung USB Drivers](https://developer.samsung.com/android-usb-driver)
- **Motorola**: [Motorola Device Manager](https://motorola-global-portal.custhelp.com/app/answers/detail/a_id/88481)
- **Xiaomi**: Geralmente já inclusos, mas pode baixar do site oficial
- **Outros**: Procure no Google: "USB drivers [modelo do seu celular]"

---

### 6️⃣ **VERIFICAR SE ADB ESTÁ INSTALADO CORRETAMENTE**

```powershell
# Verificar versão do ADB
adb version

# Se não funcionar, o ADB não está no PATH
# Instale o Android Studio ou Android SDK Platform Tools
```

**Instalar ADB sem Android Studio:**
1. Baixe: [SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)
2. Extraia para: `C:\platform-tools\`
3. Adicione ao PATH:
   - Win + R → `sysdm.cpl` → **Avançado** → **Variáveis de Ambiente**
   - Na seção **Path**, adicione: `C:\platform-tools\`
4. Feche e abra o PowerShell novamente

---

### 7️⃣ **REVOGAR AUTORIZAÇÕES USB (NO CELULAR)**

Se já tentou tudo:
1. No celular: **Configurações** → **Opções do desenvolvedor**
2. Toque em **"Revogar autorizações de depuração USB"**
3. **Desconecte** o cabo
4. **Reconecte** o cabo
5. A mensagem de permissão deve aparecer novamente

---

### 8️⃣ **ALTERNATIVA: USAR EXPO GO (MAIS FÁCIL!)**

Se a conexão USB está difícil, use **Wi-Fi**:

#### Passo 1: Instalar Expo Go
- Play Store: [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Passo 2: Conectar na mesma rede Wi-Fi
- Celular e computador devem estar na **mesma rede Wi-Fi**

#### Passo 3: Escanear QR Code
1. No PowerShell onde o Expo está rodando, você verá um **QR code**
2. Abra o app **Expo Go** no celular
3. Toque em **"Scan QR code"**
4. Aponte a câmera para o QR code no computador
5. **Pronto!** O app vai carregar

---

## 🎯 Checklist Rápido

Use este checklist para verificar tudo:

- [ ] ✅ Modo desenvolvedor ativado no celular
- [ ] ✅ Depuração USB ativada
- [ ] ✅ Pop-up "Permitir depuração USB" aceito
- [ ] ✅ Modo USB: "Transferência de arquivos" (não "Apenas carregar")
- [ ] ✅ Cabo USB de dados (não apenas carregamento)
- [ ] ✅ Porta USB direta no computador (não hub)
- [ ] ✅ Drivers USB instalados
- [ ] ✅ ADB reiniciado (`adb kill-server` e `adb start-server`)

---

## 🧪 Teste Final

Após seguir os passos, execute:

```powershell
adb devices
```

**Resultado esperado:**
```
List of devices attached
ABC123XYZ    device
```

Se aparecer `unauthorized`:
- Revogue as autorizações no celular e reconecte

Se aparecer `offline`:
- Reinicie o celular
- Reinicie o servidor ADB

---

## 💡 Recomendação

Para **desenvolvimento rápido** e sem complicações:
👉 **Use Expo Go via Wi-Fi** (muito mais simples!)

Para **widgets nativos no futuro**:
👉 Configure USB corretamente agora para fazer `npm run android`

---

## 📱 Executar Agora com Expo Go

```powershell
# Certifique-se que o servidor está rodando
npm start

# No Expo Go (celular):
# 1. Abra o app
# 2. Escaneie o QR code
# 3. Pronto!
```

**Vantagens do Expo Go:**
✅ Sem precisar de USB
✅ Sem drivers
✅ Hot reload instantâneo
✅ Funciona em qualquer rede Wi-Fi

---

Boa sorte! 🚀
