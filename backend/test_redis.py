from app.core.clients.redis_client import redis_client

redis_client.set("test_key", "NeuralDoc Redis Working")

value = redis_client.get("test_key")

print(value)