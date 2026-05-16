from dotenv import load_dotenv
import pathlib, os
proj_root = pathlib.Path(__file__).resolve().parents[1]
env_path = proj_root.joinpath('.env')
print('Looking for .env at', env_path)
load_dotenv(env_path)
print('SUPABASE_URL=', os.getenv('SUPABASE_URL'))
print('SUPABASE_ANON_KEY=', os.getenv('SUPABASE_ANON_KEY'))
# If dotenv didn't load for some reason, try manual parse
if not os.getenv('SUPABASE_URL') or not os.getenv('SUPABASE_ANON_KEY'):
	print('Dotenv did not populate keys; attempting manual parse of .env')
	with open(env_path, 'r', encoding='utf-8') as f:
		content = f.read()
	print('Raw .env content repr:\n', repr(content))
	for line in content.splitlines():
		line = line.strip()
		if not line or line.startswith('#'):
			continue
		if '=' in line:
			k, v = line.split('=', 1)
			k = k.strip()
			v = v.strip().strip('"').strip("'")
			os.environ[k] = v

	print('After manual parse:')
	print('SUPABASE_URL=', os.getenv('SUPABASE_URL'))
	print('SUPABASE_ANON_KEY=', os.getenv('SUPABASE_ANON_KEY'))
