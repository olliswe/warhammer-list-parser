from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
import glob
from .utils.main import detect_entities
from .utils.shared_utils import faction_id_to_url, detachment_id_to_url, datasheet_id_to_url
from .models import SharedList

def index(request):
    return render(request, 'list_parser/landing.html')

def parse(request):
    return render(request, 'list_parser/index.html')

def sanitized_response(entities):
    """
    Helper function to sanitize response
    """
    factions_with_urls = [
        {
            "faction_id": faction["faction_id"],
            "faction_name": faction["faction_name"],
            "is_supplement": faction.get("is_supplement", False),
            "url": faction_id_to_url(faction["faction_id"]),
        } for faction in entities.get("factions", [])
    ]
    detachment_with_urls = [
        {
            "detachment_id": entities["detachment"].get("detachment_id"),
            "detachment_name": entities["detachment"].get("detachment_name"),
            "url": detachment_id_to_url(entities["detachment"].get("detachment_id")),
        }
    ]
    datasheets_with_urls = [
        {
            "datasheet_id": ds["datasheet_id"],
            "datasheet_name": ds["datasheet_name"],
            "entry_text": ds.get("entry_text", ""),
            "url": datasheet_id_to_url(ds["datasheet_id"]),
        } for ds in entities.get("datasheets", [])
    ]
    return {
        "factions": factions_with_urls,
        "detachment": detachment_with_urls,
        "datasheets": datasheets_with_urls
    }

@csrf_exempt
@require_http_methods(["POST"])
def detect_army_entities(request):
    try:
        body = json.loads(request.body)
        army_list = body.get('army_list')
        
        if not army_list:
            return JsonResponse({'error': 'army_list parameter is required'}, status=400)
        
        entities = detect_entities(army_list)
        return JsonResponse(sanitized_response(entities))
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_datasheet(request, datasheet_id):
    """
    Retrieve a datasheet by its ID from the fixtures directory.
    Now that files are renamed with IDs, we can search efficiently by filename.
    """
    try:
        # Path to datasheets fixtures
        fixtures_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'datasheets')
        
        # Search for files ending with the datasheet_id.json across all faction directories
        datasheet_file = None
        for faction_dir in os.listdir(fixtures_path):
            faction_path = os.path.join(fixtures_path, faction_dir)
            if os.path.isdir(faction_path):
                # Look for a file that ends with _{datasheet_id}.json
                target_pattern = f"*_{datasheet_id}.json"
                matching_files = glob.glob(os.path.join(faction_path, target_pattern))
                
                if matching_files:
                    datasheet_file = matching_files[0]  # Take the first match
                    break
        
        if not datasheet_file:
            return JsonResponse({'error': f'Datasheet with ID {datasheet_id} not found'}, status=404)
        
        # Load and return the datasheet
        with open(datasheet_file, 'r', encoding='utf-8') as f:
            datasheet_data = json.load(f)
        
        return JsonResponse(datasheet_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_faction(request, faction_id):
    """
    Retrieve faction rules by faction ID from the factions.json fixture
    """
    try:
        # Path to factions fixture
        fixtures_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'factions.json')
        
        # Load and search for the faction
        with open(fixtures_path, 'r', encoding='utf-8') as f:
            factions_data = json.load(f)
        
        faction_data = None
        for faction in factions_data:
            if faction.get('faction_id') == faction_id:
                faction_data = faction
                break
        
        if not faction_data:
            return JsonResponse({'error': f'Faction with ID {faction_id} not found'}, status=404)
        
        return JsonResponse(faction_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_detachment(request, detachment_id):
    """
    Retrieve detachment rules and enhancements by detachment ID from the detachments.json fixture
    """
    try:
        # Path to detachments fixture
        fixtures_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'detachments.json')
        
        # Load and search for the detachment
        with open(fixtures_path, 'r', encoding='utf-8') as f:
            detachments_data = json.load(f)
        
        detachment_data = None
        for detachment in detachments_data:
            if detachment.get('detachment_id') == detachment_id:
                detachment_data = detachment
                break
        
        if not detachment_data:
            return JsonResponse({'error': f'Detachment with ID {detachment_id} not found'}, status=404)
        
        return JsonResponse(detachment_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def share_list(request):
    """
    Create a shared list and return the share URL
    """
    try:
        body = json.loads(request.body)
        name = body.get('name')
        raw_text = body.get('raw_text')
        parsed_data = body.get('parsed_data')
        
        if not all([name, raw_text, parsed_data]):
            return JsonResponse({'error': 'name, raw_text, and parsed_data are required'}, status=400)
        
        # Create shared list
        shared_list = SharedList.objects.create(
            name=name,
            raw_text=raw_text,
            parsed_data=parsed_data
        )
        
        # Build the share URL
        share_url = request.build_absolute_uri(f'/shared/{shared_list.slug}/')
        
        return JsonResponse({
            'success': True,
            'slug': shared_list.slug,
            'share_url': share_url
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_shared_list(request, slug):
    """
    Retrieve a shared list by slug
    """
    try:
        shared_list = get_object_or_404(SharedList, slug=slug)
        
        # Increment view count
        shared_list.increment_view_count()
        
        return JsonResponse({
            'name': shared_list.name,
            'raw_text': shared_list.raw_text,
            'parsed_data': shared_list.parsed_data,
            'created_at': shared_list.created_at.isoformat(),
            'view_count': shared_list.view_count
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def shared_list_view(request, slug):
    """
    Render the shared list using the existing parser page
    """
    shared_list = get_object_or_404(SharedList, slug=slug)
    shared_list.increment_view_count()
    
    # Reuse the existing index.html template, it will handle the parsing via URL params
    return render(request, 'list_parser/index.html')
