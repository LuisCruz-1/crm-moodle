<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pipeline extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function stages(): HasMany
    {
        return $this->hasMany(PipelineStage::class)->orderBy('position');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }
}

