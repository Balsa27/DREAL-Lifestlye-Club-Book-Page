using MagazineBackend.Application;
using MagazineBackend.Application.TransferObject.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace MagazineBackend.Presentation.Controller;

[ApiController]
[Route("[controller]")]
[Authorize]
public class MagazineController(MagazineService magazineService, MagazinePageService pageService) : MagazineControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var response = await magazineService.GetMagazineByIdAsync(id, UserId);
        return Ok(response);
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var response = await magazineService.GetAllUserMagazinesAsync(UserId);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await magazineService.DeleteMagazineAsync(id, UserId);
        return Ok();
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateAsync(CreateMagazineRequest request)
    {
        await magazineService.CreateMagazineAsync(request, UserId);
        return Ok();
    }
    
    [HttpPost("upload")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = 55485760)]
    public async Task<IActionResult> UploadAsync(UploadMagazineImageRequest request)
    {
        try
        {
            var (url, fileName) = await pageService.UploadMagazineImageAsync(request, UserId, Host);
            return Ok(new { url, fileName });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An unexpected error occurred.");
        }
    }
    
    [HttpGet("images/{fileName}")]
    [ResponseCache(Duration = 86400)]
    public async Task<IActionResult> GetImageAsync(GetMagazineImageRequest request)
    {
        var result = await pageService.GetMagazineImage(request, UserId, Host);
        if (result == null)
            return NotFound();

        var (fileBytes, contentType, etag) = result.Value;

        if (Request.Headers.IfNoneMatch.ToString() == etag)
            return StatusCode(304);

        Response.Headers.ETag = etag;
        return File(fileBytes, contentType);
    }
}