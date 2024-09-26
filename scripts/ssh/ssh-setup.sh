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
