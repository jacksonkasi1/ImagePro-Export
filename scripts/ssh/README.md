# 📦 Deploying to Hugging Face Space with GitHub Actions and SSH Authentication

Automate the deployment of your projects to Hugging Face Spaces securely using GitHub Actions with SSH authentication. This guide walks you through generating SSH keys, configuring GitHub Secrets, and ensuring secure and seamless deployments.

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

- **Script Location:** The script is available in your repository under the path `scripts/ssh/ssh-setup.sh`.

#### How to Run the Script

1. **Navigate to the Script Directory:**

   Open your terminal and navigate to the directory where the `ssh-setup.sh` script is located:

   ```bash
   cd scripts/ssh
   ```

2. **Make the Script Executable:**

   Modify the script's permissions to make it executable:

   ```bash
   chmod +x ssh-setup.sh
   ```

3. **Run the Script:**

   Execute the script by running:

   ```bash
   ./ssh-setup.sh
   ```

   - **Enter Your Email:** When prompted, input the email address you want to associate with the SSH key.

4. **Follow the Script Instructions:**

   The script will generate your SSH key pair and guide you through the steps to add the public key to Hugging Face and store the private key in GitHub Secrets.

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
   - **Key:** Paste the contents of your `id_ed25519.pub` file (as instructed in the script).
   - Click **"Add SSH Key"**.

---

## Configuring GitHub Secrets

To securely use your SSH key in GitHub Actions, you need to store the **private key** in GitHub Secrets.

#### Steps to Add the Private Key to GitHub Secrets

1. **Copy the Private Key:**

   - Use the following command to view and copy your private key (as instructed by the script):

     ```bash
     cat ~/.ssh/id_ed25519
     ```

2. **Go to Your GitHub Repository:**

   Navigate to your repository where you want to set up deployment.

3. **Access Repository Settings:**

   - Click on **"Settings"**.

4. **Add a New Secret:**

   - Go to **"Secrets and variables"** > **"Actions"**.
   - Click on **"New repository secret"**.
   - **Name:** Set the name of the secret as `HF_SSH_KEY`.
   - **Value:** Paste the private key you copied earlier into the value field.
   - Click **"Add secret"** to save.

---

## Setting Up GitHub Actions Workflow

The **GitHub Actions workflow** file for deploying to Hugging Face Spaces using SSH authentication is already available in your repository.

- **Workflow Location:** `.github/workflows/deploy_to_huggingface.yml`

This workflow automates the deployment process by:

1. Checking out the repository.
2. Setting up SSH authentication using your GitHub Secret (`HF_SSH_KEY`).
3. Adding Hugging Face as a remote.
4. Pushing the latest code to your Hugging Face Space.

You can trigger the workflow by pushing code to the `main` branch or manually via the GitHub Actions tab.

---

## Additional Tips

- **Changing SSH Key File Names:**

  If you prefer different filenames for your SSH keys, modify the `PRIVATE_KEY_FILE` and `PUBLIC_KEY_FILE` variables in the `ssh-setup.sh` script accordingly.

- **Managing Multiple SSH Keys:**

  If you have multiple SSH keys, consider using [SSH Config](https://www.ssh.com/academy/ssh/config) to manage different keys for different services.

- **Securing Your SSH Keys:**

  Ensure that your SSH private key file (`id_ed25519`) has appropriate permissions to prevent unauthorized access:

  ```bash
  chmod 600 ~/.ssh/id_ed25519
  ```

- **Regularly Rotate Keys:**

  For enhanced security, periodically generate new SSH keys and update them in both GitHub Secrets and Hugging Face.

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
