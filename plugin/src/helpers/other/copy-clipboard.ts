/**
 * Utility function to copy data to the clipboard.
 *
 * @param {string} data - The data (text) to be copied to the clipboard.
 * @returns {Promise<void>} - Resolves if the copy is successful, rejects with an error if not.
 */
export async function copyToClipboard(data: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use the modern clipboard API if available and the environment is secure
      await navigator.clipboard.writeText(data);
    } else {
      // Fallback for older browsers or insecure contexts
      const textArea = document.createElement('textarea');
      textArea.value = data;

      // Avoid displaying the textarea element
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Attempt to copy the text
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    console.log('Text copied to clipboard:', data);
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    throw new Error('Failed to copy text to clipboard.');
  }
}
