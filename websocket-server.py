#!/usr/bin/env python3
import asyncio
import websockets
import json
import logging
from datetime import datetime

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dizionario per tenere traccia delle connessioni attive
connected_clients = set()
# Dizionario per memorizzare i dati sincronizzati
sync_data = {}

async def register_client(websocket):
    """Registra un nuovo client"""
    connected_clients.add(websocket)
    client_id = id(websocket)
    logger.info(f"Nuovo client connesso: {client_id} (totale: {len(connected_clients)})")
    
    # Invia i dati esistenti al nuovo client
    if sync_data:
        await websocket.send(json.dumps({
            'type': 'sync_data',
            'data': sync_data,
            'timestamp': datetime.now().isoformat()
        }))
    
    return client_id

async def unregister_client(websocket):
    """Rimuove un client disconnesso"""
    connected_clients.discard(websocket)
    logger.info(f"Client disconnesso (totale: {len(connected_clients)})")

async def broadcast_message(message, exclude_websocket=None):
    """Invia un messaggio a tutti i client connessi"""
    if connected_clients:
        disconnected_clients = set()
        for client in connected_clients:
            if client != exclude_websocket:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
                except Exception as e:
                    logger.error(f"Errore nell'invio al client: {e}")
                    disconnected_clients.add(client)
        
        # Rimuovi i client disconnessi
        for client in disconnected_clients:
            await unregister_client(client)

async def handle_message(websocket, message):
    """Gestisce i messaggi ricevuti dai client"""
    try:
        data = json.loads(message)
        message_type = data.get('type')
        
        logger.info(f"Messaggio ricevuto: {message_type}")
        
        if message_type == 'character_update':
            # Aggiorna i dati del personaggio
            character_name = data.get('character')
            character_data = data.get('data')
            
            logger.info(f"Ricevuto character_update per: {character_name}")
            logger.info(f"Client connessi totali: {len(connected_clients)}")
            
            if character_name and character_data:
                sync_data[f'character_detail_{character_name}'] = character_data
                logger.info(f"Dati aggiornati per {character_name}")
                
                # Invia l'aggiornamento a tutti gli altri client
                broadcast_message_json = json.dumps({
                    'type': 'character_updated',
                    'character': character_name,
                    'data': character_data,
                    'timestamp': datetime.now().isoformat()
                })
                logger.info(f"Invio broadcast a {len(connected_clients) - 1} client")
                await broadcast_message(broadcast_message_json, exclude_websocket=websocket)
            else:
                logger.warning(f"Dati mancanti per character_update: character={character_name}, data={bool(character_data)}")
        
        elif message_type == 'request_sync':
            # Client richiede sincronizzazione
            await websocket.send(json.dumps({
                'type': 'sync_data',
                'data': sync_data,
                'timestamp': datetime.now().isoformat()
            }))
        
        elif message_type == 'ping':
            # Risposta al ping per mantenere la connessione attiva
            await websocket.send(json.dumps({
                'type': 'pong',
                'timestamp': datetime.now().isoformat()
            }))
            
    except json.JSONDecodeError as e:
        logger.error(f"Errore nel parsing JSON: {e}")
    except Exception as e:
        logger.error(f"Errore nella gestione del messaggio: {e}")

async def websocket_handler(websocket, path):
    """Handler principale per le connessioni WebSocket"""
    client_id = await register_client(websocket)
    
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Connessione chiusa per client {client_id}")
    except Exception as e:
        logger.error(f"Errore nella connessione: {e}")
    finally:
        await unregister_client(websocket)

async def main():
    """Funzione principale per avviare il server"""
    host = '0.0.0.0'
    port = 8765
    logger.info(f"Avvio server WebSocket su ws://{host}:{port}")

    # Avvia il server direttamente con websocket_handler
    server = await websockets.serve(
        websocket_handler,
        host,
        port
    )

    logger.info(f"Server WebSocket avviato su ws://{host}:{port}")
    # Mantieni il server in esecuzione
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server fermato dall'utente")
    except Exception as e:
        logger.error(f"Errore nel server: {e}") 