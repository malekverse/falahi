cat > filahi-autopilot.sh << 'EOF'
#!/usr/bin/env bash
cd ~/filahi   # <- change to your real path

while true; do
  opencode run --dangerously-skip-permissions --continue --model anthropic/claude-sonnet-4-6 \
    "Continue the build loop exactly as defined in OPENCODE.md. Do not stop." \
    >> opencode_autopilot.log 2>&1

  echo "--- run exited $(date), restarting in 5s ---" >> opencode_autopilot.log
  sleep 5
done
EOF
chmod +x filahi-autopilot.sh