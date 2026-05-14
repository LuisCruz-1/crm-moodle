<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;     
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Authenticatable
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'lms_user_id',
        'first_name',
        'last_name',
        'email',
        'identity_doc',
        'phone',
        'password',
        'is_suspended',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_suspended' => 'boolean',
    ];

    public function lmsUser()
    {
        return $this->belongsTo(LmsUser::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function installments()
    {
        return $this->hasMany(Installment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentSubmissions()
    {
        return $this->hasMany(PaymentSubmission::class);
    }

    public function timelineEvents()
    {
        return $this->hasMany(StudentTimelineEvent::class)->orderByDesc('created_at');
    }
}
