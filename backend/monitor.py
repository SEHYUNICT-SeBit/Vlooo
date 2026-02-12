"""
Vlooo 백엔드 모니터링 GUI 도구
다크모드 스타일 + 백엔드 제어 + 실시간 로그
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import requests
import time
import os
import sys
import signal
from datetime import datetime
from pathlib import Path

# 색상 정의 (다크모드)
COLORS = {
    'bg_main': '#1e1e1e',      # 메인 배경 (진검은)
    'bg_panel': '#252526',     # 패널 배경 (조금 밝은 검은)
    'bg_log': '#1e1e1e',       # 로그창 배경
    'text_main': '#e0e0e0',    # 메인 텍스트 (밝은 회색)
    'text_dim': '#808080',     # 어두운 텍스트
    'border': '#3e3e42',       # 테두리
    'success': '#4ec9b0',      # 성공 (청록색)
    'warning': '#dcdcaa',      # 경고 (노란색)
    'error': '#f48771',        # 에러 (빨간색)
    'info': '#569cd6',         # 정보 (파란색)
    'button_bg': '#1c1c1c',    # 버튼 배경
    'button_hover': '#2d2d30', # 버튼 hover
}

# 로그 레벨별 색상
LOG_COLORS = {
    'MAJOR': COLORS['success'],
    'MINOR': COLORS['info'],
    'CRITICAL': COLORS['error'],
    'WARNING': COLORS['warning'],
}

class VlooMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("🎬 Vlooo 백엔드 모니터")
        self.root.geometry("1000x700")
        self.root.configure(bg=COLORS['bg_main'])
        
        self.backend_process = None
        self.is_running = False
        self.monitoring = False
        self.selected_project = None
        
        self.backend_dir = Path(__file__).parent
        self.api_url = "http://localhost:8001"
        
        self.setup_styles()
        self.create_widgets()
        self.check_backend_status()
        
    def setup_styles(self):
        """다크모드 스타일 설정"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # 기본 스타일
        style.configure('TFrame', background=COLORS['bg_main'], relief='flat')
        style.configure('TLabel', background=COLORS['bg_main'], foreground=COLORS['text_main'])
        style.configure('TButton', background=COLORS['button_bg'], foreground=COLORS['text_main'])
        style.map('TButton',
                 background=[('active', COLORS['button_hover']), ('pressed', COLORS['border'])])
        
        # 커스텀 스타일
        style.configure('Title.TLabel', font=('Segoe UI', 16, 'bold'), foreground=COLORS['success'])
        style.configure('Status.TLabel', font=('Segoe UI', 10), foreground=COLORS['text_dim'])
        style.configure('Mono.TLabel', font=('Courier New', 9), foreground=COLORS['text_main'])
        
    def create_widgets(self):
        """위젯 생성"""
        # 1. 헤더 패널
        header = ttk.Frame(self.root)
        header.pack(side='top', fill='x', padx=10, pady=10)
        
        title = ttk.Label(header, text="🎬 Vlooo 백엔드 모니터", style='Title.TLabel')
        title.pack(side='left', padx=10)
        
        # 2. 상태 표시 줄
        status_frame = ttk.Frame(self.root)
        status_frame.pack(side='top', fill='x', padx=10, pady=5)
        
        ttk.Label(status_frame, text="상태:", style='Status.TLabel').pack(side='left', padx=5)
        self.status_label = ttk.Label(status_frame, text="● 대기 중", style='Status.TLabel', foreground=COLORS['text_dim'])
        self.status_label.pack(side='left', padx=5)
        
        # 3. 버튼 패널
        button_frame = ttk.Frame(self.root)
        button_frame.pack(side='top', fill='x', padx=10, pady=10)
        
        self.start_btn = tk.Button(
            button_frame,
            text="▶ 백엔드 시작",
            command=self.start_backend,
            bg=COLORS['success'],
            fg='black',
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief='flat',
            cursor='hand2'
        )
        self.start_btn.pack(side='left', padx=5)
        
        self.stop_btn = tk.Button(
            button_frame,
            text="⏹ 백엔드 종료",
            command=self.stop_backend,
            bg=COLORS['error'],
            fg='black',
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled'
        )
        self.stop_btn.pack(side='left', padx=5)
        
        self.restart_btn = tk.Button(
            button_frame,
            text="🔄 재시작",
            command=self.restart_backend,
            bg=COLORS['warning'],
            fg='black',
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled'
        )
        self.restart_btn.pack(side='left', padx=5)
        
        # 4. 로그 창
        log_label = ttk.Label(self.root, text="📋 백엔드 로그", style='Status.TLabel')
        log_label.pack(side='top', fill='x', padx=10, pady=(10, 5))
        
        self.log_text = scrolledtext.ScrolledText(
            self.root,
            height=15,
            width=120,
            bg=COLORS['bg_log'],
            fg=COLORS['text_main'],
            insertbackground=COLORS['text_main'],
            font=('Courier New', 9),
            relief='solid',
            borderwidth=1,
            wrap='word'
        )
        self.log_text.pack(side='top', fill='both', expand=True, padx=10, pady=(0, 10))
        self.log_text.config(state='disabled')
        
        # 로그 태그 설정
        self.log_text.tag_configure('MAJOR', foreground=LOG_COLORS['MAJOR'], font=('Courier New', 9, 'bold'))
        self.log_text.tag_configure('MINOR', foreground=LOG_COLORS['MINOR'])
        self.log_text.tag_configure('CRITICAL', foreground=LOG_COLORS['CRITICAL'], font=('Courier New', 9, 'bold'))
        self.log_text.tag_configure('WARNING', foreground=LOG_COLORS['WARNING'])
        self.log_text.tag_configure('timestamp', foreground=COLORS['text_dim'], font=('Courier New', 8))
        
        # 5. 프로젝트 모니터링 패널
        project_frame = ttk.Frame(self.root)
        project_frame.pack(side='bottom', fill='x', padx=10, pady=10)
        
        ttk.Label(project_frame, text="📦 모니터링 프로젝트:", style='Status.TLabel').pack(side='left', padx=5)
        self.project_label = ttk.Label(project_frame, text="없음", style='Mono.TLabel', foreground=COLORS['text_dim'])
        self.project_label.pack(side='left', padx=5, fill='x', expand=True)
        
    def log_message(self, level: str, step: str, message: str):
        """구조화된 로그 출력"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        self.log_text.config(state='normal')
        
        # 타임스탐프
        self.log_text.insert(tk.END, f'[{timestamp}] ', 'timestamp')
        
        # 로그 레벨
        if level in LOG_COLORS:
            self.log_text.insert(tk.END, f'[{level}] ', level)
        else:
            self.log_text.insert(tk.END, f'[{level}] ', 'MINOR')
        
        # 단계
        self.log_text.insert(tk.END, f'[{step}] ', 'MINOR')
        
        # 메시지
        self.log_text.insert(tk.END, f'{message}\n')
        
        # 자동 스크롤
        self.log_text.see(tk.END)
        self.log_text.config(state='disabled')
    
    def start_backend(self):
        """백엔드 시작"""
        if self.is_running:
            messagebox.showwarning("경고", "백엔드가 이미 실행 중입니다.")
            return
        
        self.log_message('MAJOR', 'BACKEND', '백엔드 시작 중...')
        
        def run_backend():
            try:
                os.chdir(self.backend_dir)
                self.backend_process = subprocess.Popen(
                    [sys.executable, 'main.py'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    bufsize=1
                )
                
                self.is_running = True
                self.update_button_states()
                self.status_label.config(text="● 실행 중", foreground=COLORS['success'])
                self.log_message('MAJOR', 'BACKEND', '✅ 백엔드 시작됨 (PID: {})'.format(self.backend_process.pid))
                
                # 로그 출력
                for line in self.backend_process.stdout:
                    line = line.rstrip()
                    if line:
                        # 백엔드 로그 파싱
                        self._parse_and_log(line)
                
                self.backend_process.wait()
                self.is_running = False
                self.update_button_states()
                self.status_label.config(text="● 중지됨", foreground=COLORS['error'])
                self.log_message('CRITICAL', 'BACKEND', '❌ 백엔드 중지됨')
                
            except Exception as e:
                self.log_message('CRITICAL', 'BACKEND', f'❌ 오류: {str(e)}')
                self.is_running = False
                self.update_button_states()
        
        thread = threading.Thread(target=run_backend, daemon=True)
        thread.start()
    
    def stop_backend(self):
        """백엔드 종료"""
        if not self.is_running or not self.backend_process:
            messagebox.showwarning("경고", "실행 중인 백엔드가 없습니다.")
            return
        
        self.log_message('MAJOR', 'BACKEND', '백엔드 종료 중...')
        
        try:
            # Graceful shutdown 시도
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Timeout 시 강제 종료
                self.backend_process.kill()
            
            self.is_running = False
            self.update_button_states()
            self.status_label.config(text="● 중지됨", foreground=COLORS['error'])
            self.log_message('MAJOR', 'BACKEND', '✅ 백엔드 종료됨')
            
        except Exception as e:
            self.log_message('CRITICAL', 'BACKEND', f'❌ 종료 오류: {str(e)}')
    
    def restart_backend(self):
        """백엔드 재시작"""
        self.log_message('MAJOR', 'BACKEND', '백엔드 재시작 중...')
        if self.is_running:
            self.stop_backend()
            time.sleep(2)
        self.start_backend()
    
    def update_button_states(self):
        """버튼 상태 업데이트"""
        self.start_btn.config(state='disabled' if self.is_running else 'normal')
        self.stop_btn.config(state='normal' if self.is_running else 'disabled')
        self.restart_btn.config(state='normal' if self.is_running else 'disabled')
    
    def _parse_and_log(self, line: str):
        """백엔드 로그 파싱"""
        # [timestamp] [LEVEL] [STEP] message 형식
        if '[' in line and ']' in line:
            parts = line.split('] ', 3)
            if len(parts) >= 3:
                timestamp = parts[0].strip('[')
                level = parts[1].strip('[]')
                step = parts[2].strip('[]')
                message = parts[3] if len(parts) > 3 else ""
                
                self.log_message(level, step, message)
            else:
                self.log_message('MINOR', 'LOG', line)
        else:
            self.log_message('MINOR', 'LOG', line)
    
    def check_backend_status(self):
        """백엔드 상태 주기적 확인"""
        def check():
            while True:
                time.sleep(5)
                if self.is_running:
                    try:
                        response = requests.get(f'{self.api_url}/api/health', timeout=2)
                        if response.status_code != 200:
                            self.status_label.config(text="● 응답 없음", foreground=COLORS['warning'])
                    except:
                        if self.is_running:
                            self.status_label.config(text="● 응답 없음", foreground=COLORS['warning'])
        
        thread = threading.Thread(target=check, daemon=True)
        thread.start()
    
    def on_closing(self):
        """창 종료 시"""
        if self.is_running:
            if messagebox.askyesno("종료 확인", "백엔드가 실행 중입니다. 종료하시겠습니까?"):
                self.stop_backend()
        self.root.destroy()

def main():
    root = tk.Tk()
    app = VlooMonitor(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
