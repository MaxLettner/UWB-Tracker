#!/bin/bash

PORT=8000

while [[ "$#" -gt 0 ]]; do
  case $1 in
    -p|--port) PORT="$2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

uvicorn main:app --host 0.0.0.0 --port "$PORT"