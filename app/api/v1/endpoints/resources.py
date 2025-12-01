import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.api import deps
from app.services.resource import resource as resource_service
from app.services.user import user as user_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Resource])
async def read_resources(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve resources.
    """
    resources = await resource_service.get_multi(db, skip=skip, limit=limit)
    return resources

@router.get("/search/", response_model=List[schemas.Resource])
async def search_resources(
    keyword: str,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Search resources by keyword.
    """
    resources = await resource_service.search(db, keyword=keyword, skip=skip, limit=limit)
    return resources

@router.post("/", response_model=schemas.Resource)
async def create_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_in: schemas.ResourceCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new resource.
    """
    resource_in.author_id = current_user.id
    resource = await resource_service.create(db, obj_in=resource_in)
    return resource

@router.get("/{resource_id}", response_model=schemas.Resource)
async def read_resource_by_id(
    resource_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific resource by id.
    """
    resource = await resource_service.get(db, id=resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.put("/{resource_id}", response_model=schemas.Resource)
async def update_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_id: int,
    resource_in: schemas.ResourceUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a resource.
    """
    resource = await resource_service.get(db, id=resource_id)
    if not resource:
        raise HTTPException(
            status_code=404,
            detail="The resource with this id does not exist in the system",
        )
    if resource.author_id != current_user.id and not user_service.is_superuser(current_user):
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    resource = await resource_service.update(db, db_obj=resource, obj_in=resource_in)
    return resource

@router.delete("/{resource_id}", response_model=schemas.Resource)
async def delete_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a resource.
    """
    resource = await resource_service.get(db, id=resource_id)
    if not resource:
        raise HTTPException(
            status_code=404,
            detail="The resource with this id does not exist in the system",
        )
    if resource.author_id != current_user.id and not user_service.is_superuser(current_user):
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    resource = await resource_service.remove(db, id=resource_id)
    return resource

@router.get("/my-resources", response_model=List[schemas.Resource])
async def read_my_resources(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve resources for the current user.
    """
    resources = await resource_service.get_multi_by_author(
        db, author_id=current_user.id, skip=skip, limit=limit
    )
    return resources

@router.get("/my-resources/status", response_model=List[schemas.Resource])
async def read_my_resources_with_status(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve resources for the current user with their statuses.
    """
    resources = await resource_service.get_multi_by_author(
        db, author_id=current_user.id, skip=skip, limit=limit
    )
    return resources

@router.get("/pending", response_model=List[schemas.Resource])
async def read_pending_resources(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve pending resources.
    """
    resources = await resource_service.get_multi_by_status(
        db, status="PENDING", skip=skip, limit=limit
    )
    return resources

@router.put("/{resource_id}/status", response_model=schemas.Resource)
async def update_resource_status(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_id: int,
    status: schemas.ResourceStatus,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a resource's status.
    """
    resource = await resource_service.get(db, id=resource_id)
    if not resource:
        raise HTTPException(
            status_code=404,
            detail="The resource with this id does not exist in the system",
        )
    resource.status = status
    resource = await resource_service.update(db, db_obj=resource, obj_in={"status": status})
    return resource

@router.post("/{resource_id}/like", response_model=schemas.Resource)
async def like_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Like a resource.
    """
    resource = await resource_service.get(db, id=resource_id)
    if not resource:
        raise HTTPException(
            status_code=404,
            detail="The resource with this id does not exist in the system",
        )
    if resource not in current_user.liked_resources:
        current_user.liked_resources.append(resource)
        await db.commit()
    return resource

@router.delete("/{resource_id}/like", response_model=schemas.Resource)
async def unlike_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Unlike a resource.
    """
    resource = await resource_service.get(db, id=resource_id)
    if not resource:
        raise HTTPException(
            status_code=404,
            detail="The resource with this id does not exist in the system",
        )
    if resource in current_user.liked_resources:
        current_user.liked_resources.remove(resource)
        await db.commit()
    return resource

@router.get("/liked", response_model=List[schemas.Resource])
async def read_liked_resources(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve liked resources.
    """
    return current_user.liked_resources

@router.post("/upload", response_model=schemas.Resource)
async def upload_file(
    *,
    db: AsyncSession = Depends(deps.get_db),
    title: str,
    resource_type: schemas.ResourceType,
    topic_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a file and create a resource.
    """
    file_location = f"media/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    resource_in = schemas.ResourceCreate(
        title=title,
        url=file_location,
        resource_type=resource_type,
        topic_id=topic_id,
        author_id=current_user.id
    )
    resource = await resource_service.create(db, obj_in=resource_in)
    return resource
