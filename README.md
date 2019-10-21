### 
    /utils/contants 에사 backend api 주소 확인.  
        - local : BACKEND_API = "http://localhost:8080";
        - love : BACKEND_API = "http://rbt.naddic.com:3000"; // Live  

        * .env 파일에 실제 DB URI 도 반드시 확인 !!!  

### 
    Deploy 방법  
        1. build  
            로컬에서 npm run build  
            git commit  
            
        2. 라이브 서버에 work dir로 이동:  
            cd frontend  
            git pull  
            sudo systemctl reload nginx  
