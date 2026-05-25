import os

from celery import Celery


broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", broker_url)

celery_app = Celery(
	"neuraldoc",
	broker=broker_url,
	backend=result_backend
)

# Ensure task modules are imported when the worker starts so Celery registers them.
celery_app.conf.update(
	task_track_started=True,
	imports=("app.workers.indexing_tasks",),
)
