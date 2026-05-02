class SQLBotFileUtils:
    """Mock file utilities class"""
    
    @staticmethod
    def split_filename_and_flag(filename: str):
        """Split filename and flag"""
        return filename, ''
    
    @staticmethod
    def check_file(file, file_types=None, limit_file_size=None):
        """Check file"""
        pass
    
    @staticmethod
    async def upload(file):
        """Upload file"""
        return 1
