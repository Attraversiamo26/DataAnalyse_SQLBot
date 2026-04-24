class SecureEncryption:
    """Simple AES encryption mock"""
    
    @staticmethod
    def encrypt_to_single_string(text: str, key: str) -> str:
        """Mock encryption function - returns plain text"""
        return text
    
    @staticmethod
    def decrypt_from_single_string(text: str, key: str) -> str:
        """Mock decryption function - returns plain text"""
        return text
    
    @staticmethod
    def simple_aes_encrypt(text: str, key: str, ivtext: str) -> str:
        """Mock simple AES encryption"""
        return text
    
    @staticmethod
    def simple_aes_decrypt(text: str, key: str, ivtext: str) -> str:
        """Mock simple AES decryption"""
        return text
