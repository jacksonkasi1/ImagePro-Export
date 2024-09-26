# 📦 Deploying to Hugging Face Space with GitHub Actions and SSH Authentication

Automate the deployment of your projects to Hugging Face Spaces securely using GitHub Actions with SSH authentication. This guide walks you through generating SSH keys, configuring GitHub Actions, and ensuring secure and seamless deployments.

## 📝 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Generating SSH Keys](#generating-ssh-keys)
   - [Using the `ssh-setup.sh` Script](#using-the-ssh-setupsh-script)
3. [Adding SSH Keys to Hugging Face](#adding-ssh-keys-to-hugging-face)
4. [Configuring GitHub Secrets](#configuring-github-secrets)
5. [Setting Up GitHub Actions Workflow](#setting-up-github-actions-workflow)
6. [Additional Tips](#additional-tips)
7. [Troubleshooting](#troubleshooting)
8. [References](#references)

---

## Prerequisites

- **GitHub Account:** Ensure you have a GitHub account with access to the repository you intend to configure.
- **Hugging Face Account:** You need a Hugging Face account to create and manage Spaces.
- **Basic Knowledge:** Familiarity with Git, GitHub Actions, and terminal commands.

---

## Generating SSH Keys

To securely authenticate with Hugging Face Spaces, you'll need to generate an SSH key pair.

### Using the `ssh-setup.sh` Script

A streamlined way to generate SSH keys is by using the provided `ssh-setup.sh` script. This script automates the creation of SSH keys and guides you through the setup process.

#### 📄 `ssh-setup.sh` Script

Create a file named `ssh-setup.sh` with the following content:

```bash
#!/bin/bash

# ssh-setup.sh
# A simple script to generate an SSH key pair for Hugging Face authentication.

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display messages in color
function echo_color {
    COLOR=$1
    MESSAGE=$2
    RESET='\033[0m'
    case $COLOR in
        "green")
            COLOR_CODE='\033[0;32m'
            ;;
        "yellow")
            COLOR_CODE='\033[1;33m'
            ;;
        "red")
            COLOR_CODE='\033[0;31m'
            ;;
        *)
            COLOR_CODE='\033[0m'
            ;;
    esac
    echo -e "${COLOR_CODE}${MESSAGE}${RESET}"
}

# Prompt user for email
read -p "Enter your email address for the SSH key: " USER_EMAIL

# Define file paths
KEY_DIR="$HOME/.ssh"
PRIVATE_KEY_FILE="$KEY_DIR/id_ed25519.txt"
PUBLIC_KEY_FILE="$KEY_DIR/id_ed25519.pub.txt"

# Create .ssh directory if it doesn't exist
mkdir -p "$KEY_DIR"

# Generate SSH key pair
echo_color "green" "Generating a new SSH key pair..."
ssh-keygen -t ed25519 -C "$USER_EMAIL" -f "$KEY_DIR/id_ed25519" -N ""

# Rename keys to .txt for easier access (optional)
mv "$KEY_DIR/id_ed25519" "$PRIVATE_KEY_FILE"
mv "$KEY_DIR/id_ed25519.pub" "$PUBLIC_KEY_FILE"

echo_color "green" "SSH key pair generated successfully!"
echo
echo_color "yellow" "Private Key: $PRIVATE_KEY_FILE"
echo_color "yellow" "Public Key: $PUBLIC_KEY_FILE"
echo
echo_color "yellow" "IMPORTANT: Keep your private key secure and do not share it."
echo
echo_color "green" "Your public key is ready to be added to Hugging Face."
echo "You can view it using the following command:"
echo
echo_color "yellow" "cat $PUBLIC_KEY_FILE"
echo
echo_color "green" "Next Steps:"
echo "1. Copy the contents of your public key:"
echo_color "yellow" "cat $PUBLIC_KEY_FILE"
echo
echo "2. Log in to your Hugging Face account."
echo "3. Navigate to [Hugging Face SSH Keys](https://huggingface.co/settings/keys)."
echo "4. Click on 'Add SSH Key' and paste your public key."
echo "5. Save the SSH key."
echo
echo_color "green" "Your SSH setup is complete!"
```

#### 📋 How to Use the `ssh-setup.sh` Script

1. **Create the Script File:**

   Open your terminal and create a new file named `ssh-setup.sh`:

   ```bash
   touch ssh-setup.sh
   ```

2. **Edit the Script:**

   Open the file in your preferred text editor (e.g., `nano`, `vim`, `code`):

   ```bash
   nano ssh-setup.sh
   ```

   Paste the script content provided above into the file, then save and exit.

3. **Make the Script Executable:**

   Modify the script's permissions to make it executable:

   ```bash
   chmod +x ssh-setup.sh
   ```

4. **Run the Script:**

   Execute the script by running:

   ```bash
   ./ssh-setup.sh
   ```

   - **Enter Your Email:** When prompted, input the email address you want to associate with the SSH key.

5. **Follow the Instructions:**

   - **View Your Public Key:** After the script runs, it will display the path to your public key. To view and copy it, use:

     ```bash
     cat ~/.ssh/id_ed25519.pub.txt
     ```

   - **Add the Public Key to Hugging Face:**
     1. Log in to your [Hugging Face account](https://huggingface.co/).
     2. Navigate to [SSH Keys Settings](https://huggingface.co/settings/keys).
     3. Click on **"Add SSH Key"**.
     4. **Title:** Give your SSH key a recognizable name (e.g., `GitHub Actions Deploy`).
     5. **Key:** Paste the contents of `id_ed25519.pub.txt` that you copied earlier.
     6. Click **"Add SSH Key"** to save.

6. **Store the Private Key Securely:**

   - The private key is saved as `~/.ssh/id_ed25519.txt`. You'll need to add this to your GitHub repository secrets for GitHub Actions.

   - **How to Add to GitHub Secrets:**
     1. **Navigate to Your GitHub Repository:**
        - Go to your repository on GitHub.
     2. **Access Repository Settings:**
        - Click on **"Settings"**.
     3. **Add a New Secret:**
        - Go to **"Secrets and variables"** > **"Actions"**.
        - Click on **"New repository secret"**.
        - **Name:** `HF_SSH_KEY`
        - **Value:** Open `~/.ssh/id_ed25519.txt` with a text editor and copy its contents. Paste it into the **Value** field.
        - Click **"Add secret"**.

---

## Adding SSH Keys to Hugging Face

After generating your SSH keys, ensure your public key is added to your Hugging Face account:

1. **Log in to Hugging Face:**

   - Navigate to [Hugging Face](https://huggingface.co/) and sign in.

2. **Access SSH Keys:**

   - Go to [Hugging Face SSH Keys](https://huggingface.co/settings/keys).

3. **Add a New SSH Key:**
   - Click on **"Add SSH Key"**.
   - **Title:** Provide a descriptive name (e.g., `GitHub Actions Deploy`).
   - **Key:** Paste the contents of your `id_ed25519.pub.txt` file.
   - Click **"Add SSH Key"**.

---

## Configuring GitHub Secrets

To securely use your SSH key in GitHub Actions:

1. **Navigate to Your GitHub Repository:**

   - Go to your repository on GitHub.

2. **Access Repository Settings:**

   - Click on **"Settings"**.

3. **Add a New Secret:**
   - Go to **"Secrets and variables"** > **"Actions"**.
   - Click on **"New repository secret"**.
   - **Name:** `HF_SSH_KEY`
   - **Value:** Open `~/.ssh/id_ed25519.txt` with a text editor and copy its contents. Paste it into the **Value** field.
   - Click **"Add secret"**.

---

## Setting Up GitHub Actions Workflow

Create a GitHub Actions workflow to automate the deployment to Hugging Face Spaces using SSH authentication.

### 📄 `.github/workflows/deploy.yml`

Add the following content to your workflow file:

```yaml
name: Deploy to Hugging Face Space

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-to-huggingface:
    runs-on: ubuntu-latest
    steps:
      # Checkout the code from the GitHub repository
      - name: Checkout the repository
        uses: actions/checkout@v3

      # Set up SSH key
      - name: Set up SSH key
        uses: webfactory/ssh-agent@v0.5.4
        with:
          ssh-private-key: ${{ secrets.HF_SSH_KEY }}

      # Add Hugging Face Space as a remote named 'space'
      - name: Add Hugging Face remote
        run: |
          git remote add space git@hf.co:spaces/<your_username>/<your_space_name>.git

      # Push the code to Hugging Face Space
      - name: Push to Hugging Face Space
        run: |
          git push --force space main
```

#### 🔍 **Configuration Details:**

- **Trigger Conditions:**

  - **Push to Main Branch:** The workflow triggers on any push to the `main` branch.
  - **Manual Trigger:** You can also manually trigger the workflow via the GitHub Actions tab.

- **Job Steps:**

  1. **Checkout Repository:**

     - Uses `actions/checkout@v3` to clone your GitHub repository into the workflow runner.

  2. **Set Up SSH Key:**

     - Utilizes `webfactory/ssh-agent@v0.5.4` to start the SSH agent and add your private SSH key (`HF_SSH_KEY`) from GitHub Secrets.

  3. **Add Hugging Face Remote:**

     - Adds your Hugging Face Space repository as a new remote named `space` using the SSH URL.
     - **Replace `<your_username>` and `<your_space_name>`** with your Hugging Face username and Space name respectively.

  4. **Push to Hugging Face Space:**
     - Force pushes (`--force`) the `main` branch to the `space` remote, deploying your latest code.

---

## Additional Tips

- **Changing SSH Key File Names:**

  - If you prefer different filenames for your SSH keys, modify the `PRIVATE_KEY_FILE` and `PUBLIC_KEY_FILE` variables in the `ssh-setup.sh` script accordingly.

- **Managing Multiple SSH Keys:**

  - If you have multiple SSH keys, consider using [SSH Config](https://www.ssh.com/academy/ssh/config) to manage different keys for different services.

- **Securing Your SSH Keys:**

  - Ensure that your SSH private key file (`id_ed25519.txt`) has appropriate permissions to prevent unauthorized access:

    ```bash
    chmod 600 ~/.ssh/id_ed25519.txt
    ```

- **Regularly Rotate Keys:**
  - For enhanced security, periodically generate new SSH keys and update them in both GitHub Secrets and Hugging Face.

---

## Troubleshooting

1. **Authentication Failures:**

   - **Issue:** `fatal: Authentication failed`
   - **Solution:** Ensure that the `HF_SSH_KEY` secret is correctly added and that the SSH key is properly associated with your Hugging Face account.

2. **Incorrect Remote URL:**

   - **Issue:** Repository not found or incorrect remote URL.
   - **Solution:** Double-check the remote URL format in your GitHub Actions workflow. It should follow:

     ```
     git@hf.co:spaces/<your_username>/<your_space_name>.git
     ```

3. **Permissions Issues:**

   - **Issue:** Insufficient permissions to push to the Hugging Face Space.
   - **Solution:** Ensure that the SSH key has the necessary permissions and that the Space exists under your Hugging Face account.

4. **SSH Agent Errors:**
   - **Issue:** SSH agent not recognizing the key.
   - **Solution:** Verify that the `webfactory/ssh-agent` action is correctly set up and that the `HF_SSH_KEY` secret contains the valid private key.

---

## References

- [Hugging Face SSH Key Guide](https://huggingface.co/docs/hub/security-git-ssh)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [webfactory/ssh-agent GitHub Action](https://github.com/webfactory/ssh-agent)
- [Generating SSH Keys](https://www.ssh.com/academy/ssh/keygen)
- [Git Remote Documentation](https://git-scm.com/docs/git-remote)
